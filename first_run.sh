#! /bin/sh

set -e

RootDir=$(cd $(dirname $0); pwd)
ScriptsDir="${RootDir}/scripts"

git=$1

function Git_Scripts {
 if [ ! -d ${ScriptsDir} ]
    then
      echo -e "\n${ScriptsDir} 目录不存在，开始克隆...\n"
      mkdir ${ScriptsDir} && git clone $git ${ScriptsDir}
      echo -e "开始安装依赖...\n"
      cd ${ScriptsDir} && npm install
    else
      cd ${ScriptsDir}
      git pull
      echo -e "git更新成功"
    fi
}
cd ${RootDir} && Git_Scripts

