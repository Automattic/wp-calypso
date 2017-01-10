/**
 * External dependencies
 */
import React from 'react';
import style from './style';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const VerticalNav = React.createClass( {
	render() {
		return (
			<div className={ style.verticalNav }>
				{ this.props.children }
			</div>
		);
	}
} );

export default withStyles( style )( VerticalNav );
