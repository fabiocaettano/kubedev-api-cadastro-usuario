<h1>Exercicio</h1>

<h2> Crie 3 ambientes para a sua API: Developer, Stage e Production.</h2> 

<h2>Cada ambiente deve ter as suas respectivas  configurações de ambiente.</h2>

--- 

Ambiente e Recursos:
* Windows 10 Pro;
* WSL2;
* Ubuntu 20.04;
* Docker;
* Kubernetes (Digital Ocean);
* IDE Visual Studio Code.

---

1. Criar um Cluster Kubernetes.

Para este exercicio foi utilizado o Kubernetes da Digital Ocean.

---


2. Realizar o Download do arquivo "config".

O arquivo config gerado pelo Kubernetes deverá ser colocado na pasta ".kube".

Executar o aplicativo WSL no Windows.

Digitar o comando abaixo no console do WSL.

Isto irá mover e renomear o arquivo para pasta ".kube":

``` bash
$ mv /mnt/c/Users/nomeDoUsuario/Downloads/k8s-1-21-9-do-0-nyc1-1644109980898-kubeconfig.yaml ~/.kube/config
```
---


3. Acessar o Ubuntu:

Checar a conexão com o Kubernetes.
O resultado serão os nodes configurados na criação do cluster.
Comando no Prompot do Ubuntu:
``` bash
$ kubernetes get nodes
```
---


4. Criar os namespaces.

O namespace ira separar os ambinentes em:  Developer, Stage e Production.
``` bash
$ kubectl create namespace developer
$ kubectl create namespace stage
$ kubectl create namespace prodcution
```

Consultar os namespaces:
``` bash
$ kubectl get namespaces
```
---

5. Service Kubernetes.

Criar o manifesto service.yaml, no diretório k8s/mongodb:
``` bash
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  selector:    
    app: mongodb    
  ports:
  - port: 27017
    targetPort: 27017
  type: ClusterIP
```

Executar o manifesto e vincular com o namespace:

``` bash
$ kubectl apply -f ~/k8s/mongodb/service.yaml -n developer
$ kubectl apply -f ~/k8s/mognodb/service.yaml -n stage
$ kubectl apply -f ~/k8s/mongodb/service.yaml -n production

```

Anotar o IP do service developer, ele sera informado no arquivo ".env" da api.

``` bash
$ kubectl get services --all-namespaces --field-selector metadata.name=mongo-service
```
---


6. Secrets Kubernetes

No linux é possível gerar o bash:
$ echo -n “nomeDoUsuario” | base64
$ echo -n “senhaDoUsuario” | base64


Criar o manifesto secret.yaml, no diretório k8s/mongodb:
``` bash
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret  
type: Opaque
data:
  MONGO_INITDB_ROOT_USERNAME: ************
  MONGO_INITDB_ROOT_PASSWORD: ************
```

Executar o manifesto:

``` bash
$ kubectl apply -f ~/k8s/mongodb/secret.yaml -n developer
```
---


7. Deployment Kubernetes

Criar o manifesto deployment.yaml, no diretorio k8s/mongodb:

``` bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
spec:
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:4.2.8
          ports:
            - containerPort: 27017
          envFrom:
            - secretRef:
                name: mongodb-secret
```

Aplicar o manifesto:
$ kubectl apply -f ./k8s/mongodb/deployment.yaml -n developer

---


8. Configurar o arquivo ".env" no diretorio da api:

``` bash
DB_URI_DEVELOPER=mongodb://mongouser:mongopwd@10.245.89.18:27017/admin
```
---

9. Criar o arquivo Dockerfile no diretório da api:

``` bash
FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install dotenv
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
```

Criar a imagem com base no arquivo Dockerfile:
 ``` bash
 $ docker build -t fabiocaettano74/api-cadastro-usuario:v1 .
 ```

 Subir a imagem para o docker hub:
 ``` bash
$ docker push fabiocaettano74/api-cadastro-usuario:v1
 ```

Criar o namespace:
``` bash
$ kubectl create namespace banco-mongodb
$ kubectl create namespace api-nodejs
```

Aplicar as configurações do Kubernetes:
``` bash
$ kubectl apply -f ./k8s/mongo/
$ kubectl apply -f ./k8s/api/
```

Localizar o IP do mongodb:
``` bash
$ kubectl get pods -n banco-mongodb -o wide
```

