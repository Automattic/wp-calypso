/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {

	displayName: 'ButtonGroup',

	render() {
		const buttonGroupClasses = classNames( 'button-group', this.props.className );

		return (
			<span className={ buttonGroupClasses }>{ this.props.children }</span>
		);
	}
} );
