/**
 * Created by jason_lee on 16/7/5.
 */
class BaseSsh extends React.Component{
        constructor(props) {
            super(props);
            this.state = {"connect_button": "ui primary button",
                          "connect_ip": "",
                          "connect_port": "22",
                          "connect_uname": "root",
                          "connect_password": "",
                          "connect_result": "test for connect",
                          "run_button": "ui button disabled teal",
                          "channel_data": "",
                          "stop_button": "ui red button disabled"
                        }
            this.connect_for_check = this.connect_for_check.bind(this);
            this.handleChange = this.handleChange.bind(this);
            this.run_command = this.run_command.bind(this);
            this.stop_command = this.stop_command.bind(this);
        }

        connect_for_check(){
          var csrftoken = getCookie('csrftoken');
          fetch('/check_connect/',{
            method: 'POST',
            dataType: 'json',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "X-CSRFToken": csrftoken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                ip: this.state.connect_ip,
                port: this.state.connect_port,
                uname: this.state.connect_uname,
                password: this.state.connect_password,

            })
          })
          .then((response) => response.json())
          .then((responseData) => {
            if (responseData["result"] == "success"){
              this.setState({run_button: "ui button teal", connect_button: "ui button primary", connect_result:"connect succeed"});
            }
            else{
              this.setState({connect_button: "ui button red", run_button: "ui disabled button teal", connect_result:"connect failed"});
            }
          })
          .catch((error) => {
            console.warn(error);
          });

        }

        handleChange(name, e) {
          var change = {};
          change[name] = e.target.value;
          this.setState(change);
        }

        run_command(){
            //console.log(this.state);
            var ws = new WebSocket('ws://127.0.0.1:8000/channel/' + this.state.connect_ip);
            ws.onopen = () => {
              // connection opened
                this.setState({run_button: "ui button teal disabled", stop_button: "ui red button"});
               var cmd = this.state.ssh_command;
              ws.send(cmd);
            };

            ws.onmessage = (e) => {
              // a message was received
              //console.log(e.data);
                this.setState({channel_data: e.data});
            };

            ws.onerror = (e) => {
              // an error occurred
              console.log(e.message);
            };

            ws.onclose = (e) => {
              // connection closed
              console.log(e.code, e.reason);
            };
                    }

        stop_command(){
            var csrftoken = getCookie('csrftoken');
          fetch('/stop_command/'+ '?ip=' +this.state.connect_ip ,{
            method: 'POST',
            dataType: 'json',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "X-CSRFToken": csrftoken,
            },
            credentials: 'same-origin',
          })
          .then((response) => response.json())
          .then((responseData) => {
            if (responseData["result"] == "success"){
                alert(responseData['content']);
              this.setState({run_button: "ui button teal", stop_button: "ui red button disabled"});
            }
            else{
              this.setState({run_button: "ui button teal disabled", stop_button: "ui red button"});
            }
          })
          .catch((error) => {
            console.warn(error);
          });
        }

        render() {
            return (
    <div>
        <div>
          <div className="ui four column doubling stackable grid container">
              <div className="column">
                        <div className="ui labeled input">
                            <div className="ui small label">
                                ip:
                            </div>
                            <input type="text" value={this.state.connect_ip} onChange={this.handleChange.bind(this, 'connect_ip')} placeholder="input ssh ip"/>
                        </div>
                    </div>

                    <div className="column">
                        <div className="ui labeled input">
                            <div className="ui small label">
                                port:
                            </div>
                            <input type="text" value={this.state.connect_port} onChange={this.handleChange.bind(this, 'connect_port')} placeholder="input ssh port" />
                        </div>
                    </div>


                    <div className="column">
                        <div className="ui labeled input">
                            <div className="ui small label">
                                uname:
                            </div>
                                <input type="text" value={this.state.connect_uname} placeholder="input ssh uname" onChange={this.handleChange.bind(this, 'connect_uname')} />
                        </div>
                    </div>

                    <div className="column">
                        <div className="ui labeled input">
                            <div className="ui small label">
                                password:
                            </div>
                                <input type="password" value={this.state.connect_password} placeholder="input ssh password" onChange={this.handleChange.bind(this, 'connect_password')} />
                        </div>
                    </div>
              </div>
              <div className="ui one column stackable center aligned page grid">
                    <div className="column twelve wide">
                        <button className={this.state.connect_button} onClick={this.connect_for_check}>{this.state.connect_result}</button>
                    </div>
              </div>
          </div>

         <div id="ssh_content">
              <div className="ui two column doubling stackable grid container">
                  <div className="column">
                      <div className="ui segment white-space-pre">
                          {this.state.channel_data}
                      </div>
                  </div>

                  <div className="column">
                      <div className="ui action input run_command">
                          <input type="text" value={this.state.ssh_command} onChange={this.handleChange.bind(this, 'ssh_command')} placeholder="input command"/>
                              <button className={this.state.run_button} onClick={this.run_command}>Run</button>
                          <button className={this.state.stop_button} onClick={this.stop_command} >stop</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
        );
        }

    }
    ReactDOM.render(<BaseSsh/>, document.getElementById('basessh'));