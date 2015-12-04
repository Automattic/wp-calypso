/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import Card from 'components/card';

module.exports = React.createClass( {
	displayName: 'LoggedOutFormContainerForm',

	render: function() {
		return (
			<Card className={ classnames( 'logged-out-form-container__form', this.props.className ) }>
				<form { ...omit( this.props.className ) }>
					{ this.props.children }
				</form>
			</Card>
		);
	}
} );
