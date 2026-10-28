# Performance

- React Docs: [Optimizing Performance](https://reactjs.org/docs/optimizing-performance.html)
- [Debugging React performance with React 16 and Chrome Devtools](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad)
- Chrome DevTools Docs: [Analyze Runtime Performance](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/)

## Server Request Profiling

> [!NOTE]
> The profiler is temporarily disabled due to non-compatibility with the current Node version.

We've included [`v8-profiler-next`](https://www.npmjs.com/package/v8-profiler-next) which allows you to generate CPU profiles (including flamegraphs) for requests to the Calypso NodeJS server. This is helpful for finding functions which impact performance the most on a given route.

To use the profiler:

1. Run `USE_SERVER_PROFILER=true yarn start`.
2. Visit a url like `calypso.localhost:3000/themes`
3. After waiting a few extra seconds, a profile file is saved to "./profiles/$route/$route-$time.cpuprofile"
4. This profile can be viewed with VS Code's built-in profile viewer by clicking on the profile in VS Code's file explorer. If you click the flame icon in the upper-right corner, VS Code will prompt to install a flamegraph viewer extension as well.

Some notes:

- The behavior of the dev server can differ from production, and having the profiler enabled can reduce performance. While profiles should not be treated as a source of truth for absolute production performance, they are still useful for seeing _relative_ performance. (E.g. to find a function which takes relatively more time than other functions.)
- Any slash in the URL ("/") is changed to "\_" in the filename. So when you access the base route ("/"), the profile will be saved to "./profiles/\_/\_-$datetime.cpuprofile"
- Only one profile can be generated at a time. If you visit another route at the same time a profile is being generated for a different route, a new profile is _not_ created. However, since the CPU is a shared resource, the impact of visiting the second route at the same time will still be visible in the first route's profile.
- Requests to various static and dev resources are not profiled.

## Bundle Analysis

To see what makes up the client bundle and how much each module weighs, run `yarn analyze-bundles` (`yarn analyze-bundles:server` for the server bundle). It builds for production and opens [webpack-bundle-analyzer](https://github.com/webpack/webpack-bundle-analyzer) at http://127.0.0.1:9898.

### Why is X bundled?

For an npm package, `yarn why <package>` lists the dependencies that pull it in. To find which of our own files import it, search the source, for example `git grep -n "from '<package>'" -- client packages`.
