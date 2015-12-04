/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import omit from 'lodash/object/omit';

module.exports = React.createClass( {
	displayName: 'LoggedOutFormContainerFooterLink',

	render: function() {
		return (
			<a
				{ ...omit( this.props, 'classNames' ) }
				className={ classnames( 'logged-out-form-container__footer-link', this.props.className ) }
			>
				{ this.props.children }
			</a>
		);
	}
} );
