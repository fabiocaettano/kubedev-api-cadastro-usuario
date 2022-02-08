<h1>Kubedev - Exercicio - Aula 15</h1>

<h2> Crie 3 ambientes para a sua API: Developer, Stage e Production.</h2> 

<h2>Cada ambiente deve ter as suas respectivas  configurações de ambiente.</h2>

<br/>
<br/>

<h3>Ferramentas utilizadas:</h3>

1. Windows 10 Pro;
2. WSL2;
3. Ubuntu 20.04;
4. Docker;
5. Git;
6. Kubernetes (Digital Ocean);
7. IDE Visual Studio Code.
<br/>
<br/>

<h3>Cluster Kubernetes</h3>

O Cluster Kubernetes foi criado através do serviço da Digital Ocean.
<br/>
<br/>


<h3>Arquivo config</h3>

1. Download
O arquivo config gerado pelo Kubernetes deverá ser colocado na pasta "~/.kube".

Executar o aplicativo WSL no Windows.

Digitar o comando abaixo no console do WSL.

Isto irá mover e renomear o arquivo para pasta ".kube":

``` bash
$ mv /mnt/c/Users/nomeDoUsuario/Downloads/k8s-1-21-9-do-0-nyc1-1644109980898-kubeconfig.yaml ~/.kube/config
```

2. Comando de Linha

Através da linha de comando é possivel acessar o contéudo do arquivo de configuração.
Esta configuração deve ser salvo em um arquivo com nome "config", na pasta "~/.kube".

``` bash
$ kubectl config view --raw=true

```
<br/>
<br/>

<h3>Ubuntu</h3>

Checar a conexão com o Kubernetes.

O resultado serão os nodes configurados na criação do cluster.

``` bash
$ kubernetes get nodes
```
<br/>
<br/>


<h3>Namespaces Kubernetes</h3>

O namespace tem a função de separar os ambientes em:  
1. Developer;
2. Stage;
3. Production.


``` bash
$ kubectl create namespace developer
$ kubectl create namespace stage
$ kubectl create namespace prodcution
```

Consultar os namespaces:
``` bash
$ kubectl get namespaces
```
<br/>
<br/>

***

<h1>Ambiente Developer</h1>

<br/>
<br/>

<h3>Service Kubernetes (MongoDb)</h3>

Criar o manifesto service.yaml, no diretório k8s/mongodb:
``` kubernetes
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
```

<br/>
<br/>

<h3>Secrets Kubernetes (MongoDb)</h3>

No linux é possível gerar o bash:
``` bash
$ echo -n “nomeDoUsuario” | base64
$ echo -n “senhaDoUsuario” | base64
```


Criar o manifesto secret.yaml, no diretório k8s/mongodb:
``` kubernetes
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

<br/>
<br/>


<h3>Deployment Kubernetes (MongoDb)</h3>

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

Executar o manifesto.
``` bash
$ kubectl apply -f ./k8s/mognodb/deployment.yaml -n developer
```

<br/>
<br/>



<h3>Variaveis de Ambiente</h3>

Anotar o IP dos services, para ser utilizado no arquivo ".env" da api.

``` bash
$ kubectl get services -n developer
```


Configurar o arquivo ".env" no diretorio da api
``` bash
DB_URI_DEVELOPER=mongodb://mongouser:mongopwd@10.245.89.18:27017/admin   
DB_USER=*********
DB_PWD=********
```

No arquivo server.js configurar o endereço do MongoDb através da variável de ambiente.

``` js
mongoose.connect(process.env.DB_URI_DEVELOPER,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth:{
        user : "*********",
        password : "********"

    }
}
```
<br/>
<br/>


<h3>Mensagem de Boas Vindas</h3>
No arquivo src/route.js da api, configurar no endpoint uma mensagem de retorno para indicar qual ambiente está sendo indicado:

``` js
routes.get('/',function(req,res){
    res.json({message: "Bem vindo ao Backend MongoDb - DEVELOPER"})
})
```
<br/>
<br/>


<h3>Dockerfile</h3>

Criar o arquivo Dockerfile no diretório da api:
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
$ docker build -t fabiocaettano74/api-cadastro-usuario-developer:v01 .
```
<br/>
<br/>


<h3>Docker Hub</h3>

Upload para o docker hub:
``` bash
$ docker push fabiocaettano74/api-cadastro-usuario-developer:v01
```
<br/>
<br/>


<h3>ConfigMap Kubernetes (API)</h3>

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
$ kubectl apply -f ./k8s/api/configmap.yaml – n developer
```
<br/>
<br/>

<h3>Service Kubernetes (API)</h3>

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
$ kubectl apply -f ./k8s/api/service.yaml – n developer
```
<br/>
<br/>

<h3>Deployment Kubernetes(API)</h3>

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
$ kubectl apply -f ./k8s/api/deployment.yaml -n developer
```
<br/>
<br/>


 <h3>Git</h3>
 
 Enviar aplicação para o Git Hub o branch developer:
 ``` bash
$ git init
$ git add .
$ git commit -m “versao developer”
$ git branch -M developer
$ git remote add origin https://github.com/fabiocaettano/kubedev-api-cadastro-usuario.git
$ git push -u origin developer
```

***

<h1>Ambiente Stage </h1>

Criar ambiente para o stage na api:
``` bash
$ git branch stage
$ git checkout stage
```


Aplicar o manifesto Service e Secret:

``` bash
$ kubectl apply -f ./k8s/mognodb/service.yaml -n stage
$ kubectl apply -f ./k8s/mongodb/secret.yaml -n stage
$ kubectl apply -f ./k8s/mongodb/deployment.yaml -n stage
```

ou em único comando:
``` bash
$ kubectl apply -f ~/k8s/mongodb/ -n stage
```

Localizar o IP:
``` bash
$ kubectl get services -n stage
```

Configurar o arquivo ".env" no diretorio da api
``` .env
DB_URI_DEVELOPER=mongodb://mongouser:mongopwd@XX.XXX.XXX.XX:27017/admin   
DB_URI_STAGE=mongodb://mongouser:mongopwd@XX.XXX.XXX.XX:27017/admin   
DB_USER=*********
DB_PWD=********
```


No arquivo server.js configurar o endereço do MongoDb através da variável de ambiente.
``` js
mongoose.connect(process.env.DB_URI_STAGE,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth:{
        user : process.DB_USER,
        password : process.DB_PWD

    }
}
```

No arquivo src/route.js da api, configurar no endpoint uma mensagem de retorno para indicar qual ambiente está sendo indicado:
``` js
routes.get('/',function(req,res){
    res.json({message: "Bem vindo ao Backend MongoDb - STAGE"})
})
```

Criar a imagem:

``` bash
$ docker build -t fabiocaettano74/api-cadastro-usuario-stage:v01 .
```

Upload para o docker hub:
``` bash
$ docker push fabiocaettano74/api-cadastro-usuario-stage:v01
```

No manifesto do deployment da api informar a imagem da api: 
``` kubernetes
spec:            
      containers:
      - name: api
        image: fabiocaettano74/api-cadastro-usuario-stage:v01
```

Apicar o manifesto para API:
``` bash
$ kubectl apply -f ./k8s/api/configmap.yaml – n stage
$ kubectl apply -f ./k8s/api/service.yaml – n stage
$ kubectl apply -f ./k8s/api/deployment.yaml -n stage
```

Ou em único comando:
``` bash
$ kubectl apply -f ./k8s/apu -n stage
```
<br/>
<br/>


<h3>Git</h3>
 
 Enviar aplicação para o Git Hub o branch stage:
 ``` bash
$ git add .
$ git commit -m “versao stage”
$ git push -u origin stage
```

<br/>
<br/>

***

<h1>Ambiente Production </h1>

Criar ambiente para o production na api:
``` bash
$ git branch production
$ git checkout production
```


Aplicar o manifesto Service e Secret:

``` bash
$ kubectl apply -f ./k8s/mognodb/service.yaml -n production
$ kubectl apply -f ./k8s/mongodb/secret.yaml -n production
$ kubectl apply -f ./k8s/mongodb/deployment.yaml -n production
```

ou em único comando:
``` bash
$ kubectl apply -f ~/k8s/mongodb/ -n production
```

Localizar o IP:
``` bash
$ kubectl get services -n production
```

Configurar o arquivo ".env" no diretorio da api
``` .env
DB_URI_DEVELOPER=mongodb://mongouser:mongopwd@XX.XXX.XXX.XX:27017/admin   
DB_URI_STAGE=mongodb://mongouser:mongopwd@XX.XXX.XXX.XX:27017/admin   
DB_URI_PRODUCTION=mongodb://mongouser:mongopwd@XX.XXX.XXX.XX:27017/admin   
DB_USER=*********
DB_PWD=********
```


No arquivo server.js configurar o endereço do MongoDb através da variável de ambiente.
``` js
mongoose.connect(process.env.DB_URI_PRODUCTION,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth:{
        user : process.DB_USER,
        password : process.DB_PWD

    }
}
```

No arquivo src/route.js da api, configurar no endpoint uma mensagem de retorno para indicar qual ambiente está sendo indicado:
``` js
routes.get('/',function(req,res){
    res.json({message: "Bem vindo ao Backend MongoDb - PRODUCTION"})
})
```

Criar a imagem:

``` bash
$ docker build -t fabiocaettano74/api-cadastro-usuario-production:v01 .
```

Upload para o docker hub:
``` bash
$ docker push fabiocaettano74/api-cadastro-usuario-production:v01
```

No manifesto do deployment da api informar a imagem da api: 
``` kubernetes
spec:            
      containers:
      - name: api
        image: fabiocaettano74/api-cadastro-usuario-production:v01
```

Apicar o manifesto para API:
``` bash
$ kubectl apply -f ./k8s/api/configmap.yaml – n production
$ kubectl apply -f ./k8s/api/service.yaml – n production
$ kubectl apply -f ./k8s/api/deployment.yaml -n production
```

Ou em único comando:
``` bash
$ kubectl apply -f ./k8s/apu -n production
```
<br/>
<br/>


<h3>Git</h3>
 
 Enviar aplicação para o Git Hub o branch stage:
 ``` bash
$ git add .
$ git commit -m “versao production”
$ git push -u origin production
```

<br/>
<br/>


***

<h1> Consultar Cluster e Testar API</h1>


 Esta consulta irá retornar o IP de cada ambiente.
``` bash
$ kubectl get services --all-namespaces --field-selector metadata.name=service-api
```

Para testar api, execute:
``` bash
$ kubectl run -i -t --image fabiocaettano74/ubuntu-with-curl:v1 ping-test --restart=Never --rm /bin/bash
```

Informe o IP do service de cada ambiente para realizar os testes.

Consultar o endpoint para receber a mensagem de boas vindas.
``` bash
root@ping-test:/# curl http://XX.XXX.XXX.XX:8080
```

Incluir um registro:
``` bash
root@ping-test:/# curl -X POST -d '{"nome":"amora","senha":"898989"}' -H "Content-Type: application/json" http://XX.XX.XXX.XX:8080/usuario
```

Realizar consulta:
``` bash
root@ping-test:/# curl http://XX.XXX.XXX.XX:8080/usuario
```

***

<h1> Resolvendo Problemas</h1>

Através do log é possivel acessar o pod

Visualizar os pods:
``` bash
$ kubectl gets pods -n nomeDoNamespace
```

Descritivo do pod:
``` bash
$ kubectl describe pod nomeDoPod -n nomeDoNamespace
```

Visualizr o log:
``` bash
$ kubectl logs pod/nomeDoPod -n nomeDoNamespace
```