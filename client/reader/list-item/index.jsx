/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';

const ListItem = React.createClass( {
	shouldComponentUpdate: function( nextProps, nextState ) {
		return React.addons.shallowCompare( this, nextProps, nextState );
	},

	render() {
		const classes = classnames( 'reader-list-item__card', this.props.className );
		return (
			<Card className={ classes }>
				{ this.props.children }
			</Card>
		);
	},
} );

export default ListItem;
