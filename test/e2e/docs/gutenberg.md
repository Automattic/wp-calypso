# Gutenberg block testing

## Getting started with writing new tests

Make sure your environment is configured so you can run tests locally. You can find detailed explanation in [Pre-requisites](../README.md#pre-requisites)

It's preferred to put specific block tests into same spec file, e.g. all Markdown tests should be added in `/specs-blocks/gutenberg-markdown-block-spec.js`. The spec file structure looks like this:

```(javascript)
describe( "Block under test @jetpack", function() {
  describe( "Test case 1", function() {
    step( 'Test step 1', function() {
      ...
    } )
  } )
  describe( "Test case 2", function() {
    ...
  } )
} )
```

You might noticed `@jetpack` - which labels this spec file to be run in CircleCI. In most cases you would like to add it in your spec file.

At this point we are using jurassic.ninja sits for testing blocks. Which means every new test should start launching new JN site & connecting Jetpack:

```(javascript)
step( 'Can create wporg site and connect Jetpack', async function() {
  this.timeout( mochaTimeOut * 12 );
  const jnFlow = new JetpackConnectFlow( driver, 'jetpackConnectUser', 'gutenpack' );
  return await jnFlow.connectFromWPAdmin();
} );

step( 'Can start new post', async function() {
  await WPAdminSidebar.refreshIfJNError( driver );
  const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
  return await wpAdminSidebar.selectNewPost();
} );
```

Feel free to use `/specs-blocks/gutenberg-markdown-block-spec.js` as an example, and check `/lib/gutenberg` folder for existing PageObjects already created.
