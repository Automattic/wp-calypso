# React Component Unit Testing

Calypso has a lot of React UI components. (Try for example running `find -name *.jsx` under the `client` folder). This combined with the fact that UI tests are among the more difficult things to (unit) test, a guide or checklist for how to make it as easy and focused as possible seems appropriate.

## [Getting started](#getting-started)

To run all current tests, run `make test` in the root source folder. You can also run individual tests by going into their folder and running `make test` there.

An easy way to find existing tests, to see how they were done or otherwise, is to run `find -name Makefile` under the folder from which you want to find the tests. This works because Makefiles are almost exclusively used for setting up a test environment for a folder. Searching the Calypso Github repository also works.

Going through the current tests is a good way to get ideas for how different kinds of things can be tested.

### [Set up a test environment](#setting-up-environment)
Tests are currently set up using Makefiles. If the component you're testing uses jsx syntax (which a lot of the React code uses, read more about it [here](https://facebook.github.io/react/docs/jsx-in-depth.html)) and hence is named .jsx, the --compilers flag with the jsx:jsx-require-extension option is needed. Otherwise you should leave it out.
```
REPORTER ?= spec
MOCHA ?= ../../../node_modules/.bin/mocha

test:
     @NODE_ENV=test NODE_PATH=test:../../ $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

.PHONY: test
```


Put this next to your component in a file named Makefile. Then make a test folder next to it and place your tests there. Now your tests should be runnable both from your component's folder and from all folders above it.


### [What to test?](#what-to-test)

This obviously varies between components, but a few easy things to start out with:
#### Does rendering the component produce expected results
Like its child components?

```javascript
this.posts = shallowRenderer.getRenderOutput();

assert.equal( this.posts.type.displayName, 'Main' );
assert.equal( this.posts.props.children[0].type.displayName, 'SidebarNavigation' );
assert.equal( this.posts.props.children[1].type.displayName, 'PostsNavigation' );
assert.equal( this.posts.props.children[2].type.displayName, 'PostList' );
```

#### Are props passed around correctly
Continuing the example from above

```javascript
// Check that it received the correct class
assert.equal( this.posts.props.className, 'posts' );

// Check that child components that should receive props receive them correctly
assert.equal( this.posts.props.children[1].props.testProp.test, 'test' );
assert.equal( this.posts.props.children[2].props.testProp.test, 'test' );
```

#### The React class's functions
Often there are individually testable functions within React classes. You can access the individual function through the class's prototype.

```javascript
this.Posts.prototype._setWarning(...);
```

#### Is interaction handled correctly
When a user for example clicks an element does the component react like it should?
Example test from `client/components/Accordion`

```javascript
var tree = TestUtils.renderIntoDocument( <Accordion title="Section" onToggle={ finishTest }>Content</Accordion> );

TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'accordion__toggle' ) ) );

function finishTest( isExpanded ) {
	expect( isExpanded ).to.be.ok;

	process.nextTick( function() {
		expect( tree.isExpanded() ).to.be.ok;
		done();
	} );
}
```

## [Techniques for avoiding calling other than the targeted code](#techniques-for-avoiding-calling-other-code)
Like their name suggests, unit tests should be targeting only one clear unit at a time. Try to minimize the amount of code you're calling outside the targeted code. This other code could be for example subcomponents, mixins, or just other functions than the one you're testing.

### [Shallow rendering](#shallow-rendering)
Shallow rendering helps with inspecting whether our component renders correctly, without having to render subcomponents. Lets hear it from Facebook themselves:

>Shallow rendering is an experimental feature that lets you render a component "one level deep" and assert facts about what its render method returns, without worrying about the behavior of child components, which are not instantiated or rendered. This does not require a DOM.
https://facebook.github.io/react/docs/test-utils.html#shallow-rendering

For a complete example of usage, see `shared/components/themes-list/test/index.jsx`.

The render function basically just draws a bunch of Theme subcomponents:
```javascript
...

render: function() {
	return (
		<ul className="themes-list">
			{ this.props.themes.map( function( theme ) {
				return (
					<li key={ 'theme' + theme.name }>
						<Theme { ...theme } />
					</li>
				);
			} ) }
		</ul>
	);
}

...

```

So we test it like this:

```javascript

this.props = {
    themes: [
        {
            name: 'kubrick',
            screenshot: '/theme/kubrick/screenshot.png',
        },
        {
            name: 'picard',
            screenshot: '/theme/picard/screenshot.png',
        }
    ]
};

var shallowRenderer = React.addons.TestUtils.createRenderer();

shallowRenderer.render(
    React.createElement( ThemesList, this.props )
);

this.themesList = shallowRenderer.getRenderOutput();

assert( this.themesList.props.children.length === this.props.themes.length, 'child count is different from themes count' );

```

So here we avoid having to actually draw the `Theme` components when testing `ThemesList`.

