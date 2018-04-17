Global Notices
==========

Unlike other components, Global Notices aren't implemented by referencing a specific component. Instead you call a function which creates the notice.

There are two kinds of notices you can use, either calling an instance of the function, or adding the notice via a the global state tree. Most of the time you'll want to add the notice to the global state tree.

Each notice has four different types:

#### Types

* `success`: Used for when the action has completed successfully
* `error`: Used for when the action went wrong
* `info`: Used for general information, and notices that don't fit the other types
* `warning`: Used for when the action has completed successfully, but something still wasn't right

----------

Using the global state tree
---------------------------

#### How to use:

```js
/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import { createNotice } from 'state/notices/actions';

class GlobalNotices extends Component {
	constructor() {
		super( ...arguments );

		this.showSuccessNotice = this.showNotice.bind( this, 'success' );
		this.showErrorNotice = this.showNotice.bind( this, 'error' );
		this.showInfoNotice = this.showNotice.bind( this, 'info' );
		this.showWarningNotice = this.showNotice.bind( this, 'warning' );
	}

	showNotice( type ) {
		const message = `This is a ${ type } notice`;
		this.props.createNotice( `is-${ type }`, message );

	}

	render() {
		return (
			<ButtonGroup>
				<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
				<Button onClick={ this.showErrorNotice }>Show error notice</Button>
				<Button onClick={ this.showInfoNotice }>Show info notice</Button>
				<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
			</ButtonGroup>
		);
	}
}

GlobalNotices.propTypes = {
	createNotice: PropTypes.func,
};

const ConnectedGlobalNotices = connect( null, { createNotice } )( GlobalNotices );
ConnectedGlobalNotices.displayName = 'GlobalNotices';
export default ConnectedGlobalNotices;

```


Using the function directly
---------------------------

#### How to use:
```js
/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import notices from 'notices';

class GlobalNotices extends Component {
	constructor() {
		super( ...arguments );

		this.showSuccessNotice = this.showNotice.bind( this, 'success' );
		this.showErrorNotice = this.showNotice.bind( this, 'error' );
		this.showInfoNotice = this.showNotice.bind( this, 'info' );
		this.showWarningNotice = this.showNotice.bind( this, 'warning' );
	}

	showNotice( type ) {
		const message = `This is a ${ type } notice`;
		notices[ type ]( message );
	}

	render() {
		return (
			<ButtonGroup>
				<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
				<Button onClick={ this.showErrorNotice }>Show error notice</Button>
				<Button onClick={ this.showInfoNotice }>Show info notice</Button>
				<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
			</ButtonGroup>
		);
	}
}

GlobalNotices.displayName = 'GlobalNotices';
export default GlobalNotices;

```