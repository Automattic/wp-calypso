# warn

warn is a tiny utility function that wraps the browsers `console.warn`
so that it does not emit in production.

If you'd like to hide output within a test,
add this line to the top of your test file:

```javascript
jest.mock( '@automattic/warn', () => () => {} );
```
