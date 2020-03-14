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
      <div className="app">
        <div className="title">
          Speed Slader
        </div>
        <div className="content">
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
  async assignmentChange (assignment) {
    const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
    const problems = assignment.replace(/\s/g, "").split(",").map(set => {
      const odd = set.includes("odd");
      const [start, end] = set.replace("odd", "").split("-").map(number => parseInt(number));
      return range(start, end ? end : start).filter(problem => !odd || problem % 2 === 1);
    }).flat().sort((a, b) => a - b);

    problems.forEach(async problem => {
      (await new Promise(async (resolve, reject) => {
        try {
          resolve([await axios({
            method: "GET",
            url: "http://localhost:4000",
            params: {
              problem
            }
          })]);
        } catch {
          const images = [];
          try {
            for (let letter = "a";; letter = String.fromCharCode(letter.charCodeAt() + 1)) {
              images.push(await axios({
                method: "GET",
                url: "http://localhost:4000",
                params: {
                  problem: problem + letter
                }
              }))
            }
          } catch {
            if (images.length === 0) reject(new Error("Invalid problem!"));
            else resolve(images);
          }
        }
      })).forEach(images => {
        console.log(images);
      })
    });
  }
}