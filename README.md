# crontab-ui

fork from [alseambusher/crontab-ui](https://github.com/alseambusher/crontab-ui)

## docker

```
docker build -t fenggaoyao/crontab-ui  .

-e SCRIPTS_URL=https://github.com/fenggaoyao/jd-script.git
docker run --rm -dit  -e BASIC_AUTH_USER=gaoyao -e BASIC_AUTH_PWD=123  -p 8080:80 fenggaoyao/crontab-ui


docker rmi $(docker images | grep "none" | awk '{print $3}')
docker stop $(docker ps -a | grep "Exited" | awk '{print $1 }') //停止容器

docker rm $(docker ps -a | grep "Exited" | awk '{print $1 }') //删除容器

docker rmi $(docker images | grep "none" | awk '{print $3}') //删除镜像

```
