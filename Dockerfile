# docker run --rm -d -p 8080:80 cloudsu/crontab-ui:latest
FROM fenggaoyao/python-node-git

ENV   CRON_PATH /etc/crontabs

RUN   mkdir /crontab-ui; touch $CRON_PATH/root; chmod +x $CRON_PATH/root

# See: https://github.com/Docker-Hub-frolvlad/docker-alpine-python3/pull/13
ENV PYTHONUNBUFFERED=1

WORKDIR /crontab-ui

COPY supervisord.conf /etc/supervisord.conf
COPY . /crontab-ui
RUN  chmod u+x ./first_run.sh && \
    npm install

ENV   HOST 0.0.0.0

ENV   PORT 80

ENV   CRON_IN_DOCKER true

EXPOSE $PORT

CMD ["supervisord", "-c", "/etc/supervisord.conf"]

