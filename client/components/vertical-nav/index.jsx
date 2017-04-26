/**
 * External dependencies
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

/**
 * Internal dependencies
 */
import style from './style';

const VerticalNav = React.createClass( {
	render() {
		return (
			<div className="vertical-nav">
				{ this.props.children }
			</div>
		);
	}
} );

export default withStyles( style )( VerticalNav );
