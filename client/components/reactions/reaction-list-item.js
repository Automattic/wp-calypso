/**
 * External dependencies
 */
import React, { Component } from 'react';

export default class ReactionListItem extends Component {
	onSelected = () => this.props.onSelected( this.props.icon, this.props.slug );
	render() {
		const { icon } = this.props;

		return (
			<li
				className="jp-reactions__list-item"
				onClick={ this.onSelected }>{ icon }
			</li>
		);
	}

}
