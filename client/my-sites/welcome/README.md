Welcome
=======

This welcome component acts as the base (think scaffolding) for all "welcome messages" used for my-sites. It is intentionally bare in order to allow individual sections fine grain control over what the message actually says.

The two pieces of included functionality are: visibility control via a close button and an optional callback function to be run at the time of close.


## Example

This is an example of creating a `welcome-message.jsx` component within a section.

*Adapted from `client/my-sites/posts/welcome-message.jsx`*

```javascript
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import store from 'store';

import user from 'lib/user';
import Welcome from 'my-sites/welcome/welcome';

class WelcomeMessage extends Component {
  buildWelcomeContent() {
    const { translate } = this.props;
    const exampleExtra = (
      <p className"legend"><Gridicon icon="info" size={ 18 } />
        { translate( 'You can use any function to build out `WelcomeContent`' ) }
      </p>
    );

    return (
      <div>
        <h3 className="welcome-section-title" tabIndex="0">{ translate( 'Welcome to the New Posts Page' ) }</h3>
        <p><img src="/calypso/images/posts/illustration-posts.svg" className="welcome-intro-illustration" />{ translate( "Example introduction message introducing the new hotness." ) }</p>
        { exampleExtra }
      </div>
    );
  },

  closeWelcomeMessage = () => {
    store.set( 'hideExampleWelcome', true );
  },

  render() {
    const currentUser = user.get();
    const showWelcome = ! store.get( 'hideExampleWelcome' );

    return (
      <Welcome isVisible={ showWelcome } closeAction={ this.closeWelcomeMessage }>
        { this.buildWelcomeContent() }
      </Welcome>
    );
  }
}

export default localize( WelcomeMessage );
```

## Properties

Property  | Description
------------- | -------------
`welcomeContent` (jsx, string, etc.) | Any content you wish to display within the welcome container
`isVisible` (boolean) | Controls initial visibility of welcome message
`closeAction` (function) | Optional callback that will run after user closes the message
`additionalClassName` (string) | Optional classes that will be added to base `.welcome-message`

## Styles

Default styles are available in `assets/stylesheets/shared/_welcome.scss`, the main includes are:

- `.welcome-section-title`: Usually an `<h3>` that acts as the welcome message title.
- `.welcome-intro-illustration`: Images that usually accompany the welcome message.
