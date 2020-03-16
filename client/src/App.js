import React from 'react';
import './App.css';
import HashLoader from "react-spinners/HashLoader";
import _ from "lodash";
import axios from "axios";

export default class App extends React.Component {
  constructor () {
    super();
    this.throttleAssignmentChange = _.debounce(this.assignmentChange, 1000);
    this.state = {
      solutions: [],
      range: [],
      page: null,
      id: 0,
      loading: false,
      error: false
    }
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
          <div>
            You can also enter a smaller range of problems in the text box below to view just those problems. <br></br>
            For example, entering "489 1-23 odd" in the assignment text box and then just "4-5" in the text box below would only show problems 4 and 5 from that assignment.
          </div>
          <input type="text" onChange={e => this.changeRange(e.target.value)}></input>
          <div>
            {this.state.error && "An error occurred. Make sure you entered the assignment correctly."}
            <HashLoader
              size={100}
              color={"#ff8800"}
              loading={this.state.loading}
            />
            {this.state.rangeError ? "Invalid problem range." : this.state.range && this.state.solutions.filter(solution => this.state.range.length === 0 || this.state.range.includes(solution.problem)).map(solution =>
              <div className="solution-container" key={solution.problem + (solution.letter ? solution.letter : "")}>
                <div className="solution-problem">{solution.letter ? solution.problem + solution.letter : solution.problem}.</div>
                <img src={'data:image/png;base64,' + solution.image.data} width="95%" alt={solution.problem + (solution.letter ? solution.letter : "")}></img>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  async assignmentChange (assignment) {
    const oldID = this.state.id;
    this.setState(state => ({
      loading: true,
      error: false,
      id: state.id + 1
    }));
    try {
      const page = assignment.substring(0, assignment.indexOf(" "));
      let problems = assignment.length === 0 ? [] : this.getRange(assignment.substring(assignment.indexOf(" ")));
      const getFilteredSolutions = state => state.page === page ? state.solutions.filter(solution => problems.includes(solution.problem)) : [];
      this.setState(state => ({
        solutions: getFilteredSolutions(state),
        page,
        promises: []
      }));
      problems = problems.filter(problem => !getFilteredSolutions(this.state).map(solution => solution.problem).includes(problem)).map(async problem => {
        return (new Promise(async (resolve, reject) => {
          try {
            await this.addSolution(this.state.id, page, problem);
            resolve();
          } catch (e) {
            let letters = 0;
            for (let letter = "a";; letter = String.fromCharCode(letter.charCodeAt() + 1)) {
              try {
                await this.addSolution(this.state.id, page, problem, letter);
              } catch {
                if (letters === 0) reject();
                else break;
              } finally {
                letters++;
              }
            }
            resolve();
          }
        })).catch(e => {
          this.setState({
            error: true
          });
        });
      });
      await Promise.all(problems);
      if (this.state.id === oldID + 1) {
        this.setState({
          loading: false
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({
        error: true
      });
    }
  }
  async addSolution (id, page, problem, letter) {
    const image = {
      problem,
      letter,
      image: await axios({
        method: "GET",
        url: this._self ? "http://localhost:4000" : "https://speed-slader-server.herokuapp.com",
        params: {
          page,
          problem: letter ? problem + letter : problem
        }
      })
    }
    if (this.state.id === id) {
      this.setState(state => ({
        solutions: state.solutions.concat([image]).sort((a, b) => a.problem > b.problem ? 1 : a.problem < b.problem ? -1 : a.letter > b.letter ? 1 : -1)
      }));
    }
  }
  getRange (rangeText) {
    const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
    return rangeText.replace(/\s/g, "").split(",").map(set => {
      const odd = set.includes("odd");
      const [start, end] = set.replace("odd", "").split("-").map(number => parseInt(number));
      return range(start, end ? end : start).filter(problem => !odd || problem % 2 === 1);
    }).flat().sort((a, b) => a - b);
  }
  changeRange (rangeText) {
    this.setState({
      rangeError: false
    }, () => {
      let range;
      try {
        range = rangeText.length === 0 ? [] : this.getRange(rangeText);
        this.setState({
          range
        });
      } catch {
        this.setState({
          rangeError: true
        });
      }
    });
  }
}