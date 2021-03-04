#! /bin/sh
repo_full_name=$1
tag=$2
Url="registry.cn-hangzhou.aliyuncs.com/${repo_full_name}:${tag}"
ssh root@106.53.76.57 << eeooff
#set -x
# sh hook.sh cloudsu/crontab-ui 2.1.6
function crontab(){
id=\$(docker ps | grep 'dollymi' | awk '{print \$1}')
if [ -z "\$id" ]; then
  docker run -d --name dollymi -p 7000:80 ${Url}
else
  docker stop \$id && docker rm \$id && docker run -d --name dollymi -p 7000:80 ${Url}
fi
}
if [ $repo_full_name = "cloudsu/crontab-ui" ]; then  
   echo "调用生成crontab"
   crontab   
fi       
exit
eeooff
echo done!