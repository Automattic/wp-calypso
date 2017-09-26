/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';

class ListItem extends React.PureComponent {
	render() {
		const classes = classnames( 'reader-list-item__card', this.props.className );
		return <Card className={ classes }>{ this.props.children }</Card>;
	}
}

export default ListItem;
