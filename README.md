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

