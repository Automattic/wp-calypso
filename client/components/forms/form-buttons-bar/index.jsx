/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

module.exports = React.createClass( {

	displayName: 'FormButtonsBar',

	render: function() {
		return (
			<div
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-buttons-bar' ) } >
				{ this.props.children }
			</div>
		);
	}
} );
