/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default React.createClass( {
	displayName: 'LoggedOutFormFooter',

	propTypes: {
		children: React.PropTypes.node.isRequired,
		className: React.PropTypes.string
	},

	render() {
		return (
			<Card className={ classnames( 'logged-out-form__footer', this.props.className ) } >
				{ this.props.children }
			</Card>
		);
	}
} );
