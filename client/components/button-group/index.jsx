/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {

	displayName: 'ButtonGroup',

	propTypes: {
		children( props ) {
			let error = null;
			React.Children.forEach( props.children, ( child ) => {
				if ( ! child.props || child.props.type !== 'button' ) {
					error = new Error( 'All children elements should be a Button.' );
				}
			} );
			return error;
		}
	},

	render() {
		const buttonGroupClasses = classNames( 'button-group', this.props.className );

		return (
			<span className={ buttonGroupClasses }>{ this.props.children }</span>
		);
	}
} );
