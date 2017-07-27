/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

module.exports = React.createClass( {

	displayName: 'FormFieldset',

	render: function() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-fieldset' ) } >
				{ this.props.children }
			</fieldset>
		);
	}
} );
