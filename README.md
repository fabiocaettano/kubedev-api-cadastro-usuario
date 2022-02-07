<h1>Exercicio</h1>

<h2> Crie 3 ambientes para a sua API: Developer, Stage e Production.</h2> 

<h2>Cada ambiente deve ter as suas respectivas  configurações de ambiente.</h2>

1. <b>Ferramentas utilizadas neste exercicio:</b>
- Windows 10 Pro;
- WSL2;
- Ubuntu 20.04;
- Docker;
- Kubernetes (Digital Ocean);
- IDE Visual Studio Code.
<br>

2. <b>Criar um Cluster Kubernetes.</b>

Para este exercicio foi utilizado o Kubernetes da Digital Ocean.
<br>

3. <b>Realizar o Download do arquivo "config".</b>

O arquivo config gerado pelo Kubernetes deverá ser colocado na pasta ".kube".

Executar o aplicativo WSL no Windows.

Digitar o comando abaixo no console do WSL.

Isto irá mover e renomear o arquivo para pasta ".kube":

``` bash
$ mv /mnt/c/Users/nomeDoUsuario/Downloads/k8s-1-21-9-do-0-nyc1-1644109980898-kubeconfig.yaml ~/.kube/config
```
<br>

4. <b>Acessar o Ubuntu</b>

Checar a conexão com o Kubernetes.
O resultado serão os nodes configurados na criação do cluster.
Comando no Prompot do Ubuntu:
``` bash
$ kubernetes get nodes
```
<br>


5. <b>Criar os namespaces</b>

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
<br>

6. <b>Service Kubernetes</b>

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

7. Secrets Kubernetes

No linux é possível gerar o bash:
``` bash
$ echo -n “nomeDoUsuario” | base64
$ echo -n “senhaDoUsuario” | base64
```


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


8. Deployment Kubernetes

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



9. Configurar o arquivo ".env" no diretorio da api:

``` bash
DB_URI_DEVELOPER=mongodb://mongouser:mongopwd@10.245.89.18:27017/admin
```

10.  No arquivo server.js configurar o endereço do MongoDb através da variável de ambiente.

``` bash
mongoose.connect(process.env.DB_URI_DEVELOPER,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth:{
        user : "mongouser",
        password : "mongopwd"

    }
}
```
11. No arquivo src/route.js da api, configurar no endpoint uma mensagem de retorno para indicar qual ambiente está sendo indicado:

``` bash
routes.get('/',function(req,res){
    res.json({message: "Bem vindo ao Backend MongoDb - DEVELOPER"})
})
```

12. Criar o arquivo Dockerfile no diretório da api:

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

Criar a imagem
``` bash
$ docker build -t fabiocaettano74/api-cadastro-usuario:developer .
```

13. Upload para o docker hub:
``` bash
$ docker push fabiocaettano74/api-cadastro-usuario:developer
```

14. ConfigMap (API)

Criar o manifesto configmap.yaml, no diretório k8s/api.
``` bash
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-api  
data:
  Mongo__Database: admin
  Mongo__Host: mongo-service
  Mongo__Port: "27017"
```

Aplicar o manifesto:
``` bash
$ kubectl apply -f ~/path/configmap.yaml – n developer
```

15. Service (API)

Criar o manifesto service.yaml, no diretorio k8s/api.

``` bash
apiVersion: v1
kind: Service
metadata:
  name: service-api  
spec:
  selector:
    app: api
  ports:
  - port: 8080
    targetPort: 8080
    name: http
  - port: 443
    targetPort: 443
    name: https
  type: NodePort
```

Aplicar o manifesto:
``` bash
$ kubectl apply -f ~/k8s/api/service.yaml – n developer
```

16. Deployment Kubernetes(API)

Criar o manifesto deployment.yanl, no diretorio k8s/api:
``` bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  selector:
    matchLabels:
      app: api
  template:
    metadata:          
      labels:
        app: api
    spec:            
      containers:
      - name: api
        image: fabiocaettano74/api-cadastro-usuario-developer:v01
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 443
          name: https
        imagePullPolicy: Always
        envFrom:
          - configMapRef:
              name: configmap-api
        env:
          - name: Mongo__User
            valueFrom:
              secretKeyRef:
                key: MONGO_INITDB_ROOT_USERNAME
                name: mongodb-secret
          - name: Mongo__Password
            valueFrom:
              secretKeyRef:
                key: MONGO_INITDB_ROOT_PASSWORD
                name: mongodb-secret           
```

Aplicar o manifesto:
``` bash
$ kubectl apply -f ~/path/deployment.yaml -n developer
```

17. Consultar todos os serviços:
``` bash
$ kubectl get all -n developer
```

18. Anotar o IP do service-api:
``` bash
$ kubectl get services -n developer
```

19. Testar api

``` bash
$ kubectl run -i -t --image fabiocaettano74/ubuntu-with-curl:v1 ping-test --restart=Never --rm /bin/bash
```

Consulta:
``` bash
root@ping-test:/# curl http://10.245.219.223:8080
```

Realizar um insert:
``` bash
root@ping-test:/# curl -X POST -d '{"nome":"amora","senha":"898989"}' -H "Content-Type: application/json" http://10.245.219.223:8080/usuario
```

Outra consulta:
``` bash
root@ping-test:/# curl http://10.245.219.223:8080/usuario
```