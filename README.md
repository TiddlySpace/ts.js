[![Build Status](https://travis-ci.org/TiddlySpace/ts.js.png)](https://travis-ci.org/TiddlySpace/ts.js)

# About

ts.js is an amalgamation of TiddlySpace used to drive admin
interfaces used by TiddySpace users to do things like load
SiteIcons, change passwords, register, do inclusions, etc.

It's in the process of being cleaned up.

# Contributing

## Requirements

* node
* grunt: `npm install -g grunt-cli`

## Setup

Run:

    npm install

Then:
    grunt

This does the following:

* Installs the project dependencies (grunt tasks).
* Downloads required third-party JS files.
* Runs JSHint across the source files.
* Runs tests using Jasmine.

# Testing

Run `grunt jasmine` to run the tests in the command line.
It spits out `_SpecRunner.html` which you can run in a browser of your choice.

# Code Coverage

Is reported in `tmp/coverage` after the tests have run.