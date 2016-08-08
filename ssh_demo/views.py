# -*- coding:utf-8 -*-
from django.shortcuts import render, HttpResponse, Http404
import paramiko
import json
import redis
from ssh_channel import SShChannel
# Create your views here.


def ssh_home(request):
    print 'test'
    return render(request, 'ssh_home.html')


def check_connect(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ip = data.get("ip")
        port = int(data.get("port"))
        uname = data.get("uname")
        password = data.get("password")
        ssh = paramiko.SSHClient()
        ssh.load_system_host_keys()
        try:
            ssh.connect(ip, port, uname, password)
        except paramiko.AuthenticationException:
            ssh = None
        if ssh is not None:
            r = redis.Redis(host='localhost', port=6379, db=0)
            if not r.get(ip):
                r.set(ip, [port, uname, password])
            return HttpResponse(json.dumps({"result": "success"}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"result": "failed"}), content_type="application/json")
    else:
        return Http404


def stop_command(request):
    ip = request.GET.get('ip')
    r = redis.Redis(host='localhost', port=6379, db=0)
    info = eval(r.get(ip))
    port = info[0]
    uname = info[1]
    password = info[2]
    cmd = info[3]
    info.remove(cmd)
    r.set(ip, info)
    channel = SShChannel(ip=ip, password=password, port=port, uname=uname)
    channel.base_command(cmd='pkill -f \'%s\'' % cmd)
    print {"result": "success", "content": "stop %s success" % cmd}
    return HttpResponse(json.dumps({"result": "success", "content": "stop cmd:%s success" % cmd}),
                        content_type="application/json")
