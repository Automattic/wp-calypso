/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import omit from 'lodash/omit';

const FormSelect = React.createClass( {
	render() {
		return (
			<select { ...omit( this.props, 'classname' ) } className={ classnames( this.props.className, 'form-select' ) } >
				{ this.props.children }
			</select>
		);
	}
} );

export default FormSelect;
