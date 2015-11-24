# Troubleshooting

## Building
This section lists known problems you can encounter while building the project.
If you have a problem when running `make run` - this is the proper section to look for a solution.

### EMFILE - too many open files

Examples of this error message can look like:
`Error: EMFILE, too many open files` or `Module build failed: Error: EMFILE`

This issue can sometimes occur on OSX. It is caused by build system trying to open many files at once. On OSX, the limit of files open at the same time is pretty low and while compiling, webpack can reach this limit.

##### Solution
```
sudo ulimit -n 16384
```
This will bump your limit to 16384 files. There is also more permanent solution described here: http://docs.basho.com/riak/latest/ops/tuning/open-files-limit/#Mac-OS-X

### Run as administrator
Sometimes, usually during the first build, you can see a message similar to `Please try running again as an administrator`. 
Just run
```
sudo make run
```

### Other build problems - try to clean the build
Sometimes, especially while switching branches, previous build leaves some artifacts in your directory.
This can cause problems with the next build. Simply re-runnning `make run` doesen't always clean it up.
To clean up directory, just run:
```
make distclean
```

## Running
When you open http://calypso.localhost:3000 in your browser and you encounter some problems - this is the proper section to look for answers.

### I can see only big **W** logo!
![Only logo](https://cldup.com/8TZOLiD6WC-2000x2000.png)

#### Domain other than calypso.localhost
Please remember to access Calypso via **http://calypso.localhost:3000**

Any other url will not work.

#### JavaScript off
Calypso requires JavaScript to function. Please enable it in your browser.

#### I still have problems!
We suggest you open the devTools and see if there maybe is some JavaScript error preventing code execution.


### An active access token must be used to query information about the current user.
![An active access token must be used to query information about the current user](https://cldup.com/F0mPgigEp4-3000x3000.png)

Please remember, that you have to log in to http://wordpress.com/login first to save a proper cookie in your browser.

