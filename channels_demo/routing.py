# -*- coding:utf-8 -*-
from channels.routing import route, include
from ssh_demo.consumers import ws_add, ws_message, ws_disconnect


channel_routing = [
    route("websocket.connect", ws_add, path=r"^/(?P<ip>d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/$"),
    route("websocket.receive", ws_message),
    route("websocket.disconnect", ws_disconnect),
]

routing = [
    # You can use a string import path as the first argument as well.
    include(channel_routing, path=r"^/channel")
]

# channel_routing = [
#     route("websocket.connect", ws_add),
#     route("websocket.receive", ws_message),
#     route("websocket.disconnect", ws_disconnect),
# ]
