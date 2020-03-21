# speed-slader

Speed Slader is a website that makes checking solutions for questions from the Stewart Calculus 8th Edition textbook easier. You can find the live website at https://speed-slader.herokuapp.com. The site may take a few moments to load, as it goes to sleep during periods of inactivity.

# Implementation

The website is built using React for the frontend. Images of the solutions to problems are requested from an API made with Express, which uses the puppeteer npm package to crawl https://slader.com and find the solution for the requested problem.

# Features

Speed Slader converts an input string of an assignment to a set of problems, which can then be used to query the API. For example, the input string "500 11-57 odd" is used to query the API for problems 11, 13, 15... 55, 57 on page 500.

The concurrent nature of the API requests allows for multiple solutions to be requested at once, which speeds up the process of getting all solutions for a long assignment.