#! /bin/sh

set -e

project=$1
br=$2
git=$3
node=$4
callback=$5

RootDir=$(cd $(dirname $0); pwd)
ScriptsDir="${RootDir}/scripts/${project}"


function Git_Scripts {
 if [ ! -d ${ScriptsDir} ]
    then
      echo -e "\n${ScriptsDir} 目录不存在，开始克隆...\n"
      mkdir ${ScriptsDir} && git clone -b $br $git ${ScriptsDir}      
      if [ $node="node" ] 
        then 
          echo -e "node开始安装依赖...\n" && cd ${ScriptsDir} && npm install  
      fi 
    else
      cd ${ScriptsDir} 
      git fetch --all && git reset --hard origin/$br && git pull 
      if [ $node="node" ]  
         then  
            npm install   
      fi   
      if [ $callback ]   
         then  
           npm install  && $node $callback  
      fi   
      echo -e "git更新成功"
    fi
}
Git_Scripts

