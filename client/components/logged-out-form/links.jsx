/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import omit from 'lodash/object/omit';

module.exports = React.createClass( {
	displayName: 'LoggedOutFormLinks',

	render: function() {
		return (
			<div
				{ ...omit( this.props, 'classNames' ) }
				className={ classnames( 'logged-out-form__links', this.props.className ) }
			>
				{ this.props.children }
			</div>
		);
	}
} );
