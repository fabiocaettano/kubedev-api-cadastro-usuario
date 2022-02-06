Ambiente e Recursos:
* Windows 10 Pro;
* WSL2;
* Ubuntu 20.04;
* Docker;
* Kubernetes (Digital Ocean);
* IDE Visual Studio Code.


1. Cria o cluser Kubernetes.
   Realizar o Download do arquivo config.

2. O arquivo config gerado pelo Kubernetes deverá ser colocado na pasta ".kube" no Ubuntu.

Executar o aplicativo WSL no Windows.

Digitar o comando abaixo no console do WSL, para mover e renomear o arquivo para pasta ".kube":
``` bash
$ mv /mnt/c/Users/nomeDoUsuario/Downloads/k8s-1-21-9-do-0-nyc1-1644109980898-kubeconfig.yaml ~/.kube/config
```

Checar a conexão com o Kubernetes, o resultado serão os nodes configurados na criação do cluster.
Comando no Prompot do Ubuntu:
``` bash
$ kubernetes get nodes
```

3. Criar os namespaces.
O namespace ira separar os ambinentes em:  Developer, Stage e Production.
Comando no Prompot do Ubuntu:
``` bash
$ kubectl create namespace developer
$ kubectl create namespace stage
$ kubectl create namespace prodcution
```

Consultar os namespaces:
``` bash
$ kubectl get namespaces
```

4. Criar o serviço para o MongoDb.
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

