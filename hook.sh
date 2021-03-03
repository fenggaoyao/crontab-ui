   #! /bin/sh

set -e

repo_full_name=$1
tag=$2
region=$3

Url="registry.cn-hangzhou.aliyuncs.com/${repo_full_name}:${tag}"

ssh root@106.53.76.57

id=`docker ps  | grep "coin" | awk '{print $1}'`


if [ -z "$id" ]; then
    echo "Empty"
else
    echo "Not empty"
fi

