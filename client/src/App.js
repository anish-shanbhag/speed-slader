import React from 'react';
import './App.css';
import _ from "lodash";
import axios from "axios";

export default class App extends React.Component {
  constructor () {
    super();
    this.throttleAssignmentChange = _.throttle(this.assignmentChange, 1000);
  }
  render () {
    return (
      <div class="app">
        <div class="title">
          Speed Slader
        </div>
        <div class="content">
          <div>
            Enter your assignment below using the following syntax: (page) (assignment). <br></br>
            For example: 646 1-23 odd, 25-29 <br></br> <br></br>
            You can also enter individual problems, using the syntax (page) (problem number) <br></br>
            For example: 646 21
          </div>
          <input type="text" onChange={e => this.throttleAssignmentChange(e.target.value)}></input>
        </div>
      </div>
    );
  }
  assignmentChange (assignment) {
    const urls = assignment.replace(/\s/g, "").split(",").map(set => set.includes("odd"));
    console.log(assignment);
  }
}