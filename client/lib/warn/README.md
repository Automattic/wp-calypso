warn
======
warn is a tiny utility function that wraps the browsers `console.warn` 
so that it only emits in development and test environments.

If you'd like to hide output within a test, you can with:

```javascript
jest.mock( 'lib/warn', () => () => {} ); 
```
