# Disallow creation of selectors bound to Redux state

Disallows the anti-pattern of creating functions within the function that gets passed as the first argument to `react-redux#connect`, _aka_ within `mapStateToProps`. See [`wp-calypso#14024`](https://github.com/Automattic/wp-calypso/issues/14024) for details. The title of this document mentions selectors because their appearance is what originated this rule, but all functions apply.

## Rule details

Any function, whether anonymous or referred to using a variable, that is passed as `connect`'s first argument cannot contain any sort of function creation within its body. This includes explicit function creation and implicit creation using `Function#bind` and `lodash#bind`, as well as `lodash#partial` and `lodash#partialRight`.

### Forbidden

```js
connect( ( state ) => ( {
  getSite: getSite.bind( null, state ),
} ) )( MyComponent );

// or

const mapState = ( state ) => ( {
  getSite: ( id ) => getSite( state, id ),
} );
connect( mapState )( MyComponent );
```

### Allowed

```js
const getFavoriteSites = ( state ) =>
  state.favoriteSiteIds.map( siteId =>
    getSite( state, siteId ) );
```

```js
class extends Component {
  setFoo( foo ) {
    this.setState( { foo }, ( state ) => {
      this.markDone( state.bar );
    } );
  }
}
```

```js
export default connect(
  partialRight( mapState, 'foo' )
)( MyComponent );
```
