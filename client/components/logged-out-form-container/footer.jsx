/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

module.exports = React.createClass( {
	displayName: 'LoggedOutFormContainerFooter',

	render: function() {
		return (
			<Card className={ classnames( 'logged-out-form-container__footer', this.props.className ) } >
				{ this.props.children }
			</Card>
		);
	}
} );
