/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

module.exports = React.createClass( {
	displayName: 'LoggedOutFormContainer',

	render: function() {
		return (
			<div className={ classnames( 'logged-out-form-container', this.props.className ) } >
				{ this.props.children }
			</div>
		);
	}
} );
