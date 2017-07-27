/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

export default React.createClass( {

	displayName: 'FormRadio',

	render: function() {
		var otherProps = omit( this.props, [ 'className', 'type' ] );

		return (
			<input
				{ ...otherProps }
				type="radio"
				className={ classnames( this.props.className, 'form-radio' ) } />
		);
	}
} );
