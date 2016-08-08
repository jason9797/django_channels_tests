# -*- coding:utf-8 -*-
from django.http import HttpResponse
from channels.handler import AsgiHandler
import redis
from ssh_channel import SShChannel


def ws_add(message):
    print 'connected'


def ws_message(message):
    # ASGI WebSocket packet-received and send-packet message types
    # both have a "text" key for their textual data.
    count = 0
    ip = message.content['path'].split('/')[2]
    r = redis.Redis(host='localhost', port=6379, db=0)
    info = eval(r.get(ip))
    port = info[0]
    uname = info[1]
    password = info[2]
    print ip, port, uname, password
    print message.content['text']
    cmd = message.content['text']
    info.append(cmd)
    print info
    r.set(ip, info)
    print r.get(ip)
    channel = SShChannel(ip=ip, password=password, port=port, uname=uname)
    print 'send message'
    channel.channel_command(cmd=cmd, message=message)


def ws_disconnect(message):
    ip = message.content['path'].split('/')[2]
    r = redis.Redis(host='localhost', port=6379, db=0)
    info = eval(r.get(ip))
    port = info[0]
    uname = info[1]
    password = info[2]
    cmd = info[3]
    print cmd
    r.set(ip, info[:3])
    channel = SShChannel(ip=ip, password=password, port=port, uname=uname)
    channel.base_command(cmd='pkill -f \'%s\'' % cmd)
    print 'disconnected'
