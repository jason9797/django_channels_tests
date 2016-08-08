# -*- coding:utf-8 -*-
import paramiko
import re


class SShChannel(object):

    def __init__(self, ip, port, uname, password):
        self._ssh = paramiko.SSHClient()
        self._ssh.load_system_host_keys()
        self._ssh.connect(ip, port, uname, password)

    def channel_command(self, cmd, message):
        rep = {"\x1b": '', "[m": '', "\x0f": '', "[K": '', "[6;1H": '', "[7m": '', "[H": ''}
        rep = dict((re.escape(k), v) for k, v in rep.iteritems())
        pattern = re.compile("|".join(rep.keys()))
        channel_obj = self._ssh.invoke_shell()
        channel_obj.settimeout(60)
        newline = '\r'
        # line_buffer = ''
        channel_obj.send(cmd + ' ; exit ' + newline)
        while True:
            channel_buffer = channel_obj.recv(8888).decode('UTF-8')
            if len(channel_buffer) == 0:
                break
            # channel_buffer = channel_buffer.replace('\r', '')
            # if channel_buffer != '\n':
            #     line_buffer += channel_buffer
            # else:
            #     # print pattern.sub(lambda m: rep[re.escape(m.group(0))], line_buffer)
            # print pattern.sub(lambda m: rep[re.escape(m.group(0))], channel_buffer)
            message.reply_channel.send({
                                     "text": pattern.sub(lambda m: rep[re.escape(m.group(0))], channel_buffer),
                                     })
            # line_buffer = ''

    def base_command(self, cmd):
        stdin, stdout, stderr = self._ssh.exec_command(cmd)
        print stdout.readlines()
        print stderr.readlines()
        return True

