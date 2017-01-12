/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import style from './style';

const VerticalNav = React.createClass( {
	render() {
		return (
			<div className={ style.verticalNav }>
				{ this.props.children }
			</div>
		);
	}
} );

export default VerticalNav;
