/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import ReactionList from './reaction-list';

export default class Reactions extends Component {
	static propTypes = {
		onSelected: PropTypes.func,
	};

	state = {
		reactionIcon: '',
		reactionSlug: '',
		showingList: false,
		listDisplayBlocked: false,
	};

	toggleShowingList = () => this.setState( {
		showingList: ! this.state.showingList,
	} );

	onSelected = ( icon, slug ) => {
		this.setState( {
			showingList: false,
			reactionIcon: icon,
			reactionSlug: slug,
		} );
		this.props.onSelected && this.props.onSelected( icon, slug );
	}

	render() {
		const {
			reactionIcon,
			reactionSlug,
			showingList,
		} = this.state;

		const icon = reactionIcon || <Gridicon icon="heart-outline" />;

		return (
			<div>
				<button
					ref="reactionsButton"
					onClick={ this.toggleShowingList }>
					<span className="reactions__button">{ icon }</span>
					{ reactionSlug }
				</button>
				<Popover
					context={ this.refs && this.refs.reactionsButton }
					isVisible={ showingList }
					className="reactions__popover"
					position="top">
					<ReactionList onSelected={ this.onSelected } />
				</Popover>
			</div>
		);
	}
}
