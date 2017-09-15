/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	DEFAULT_ICON,
	DEFAULT_SLUG,
} from './constants';
import Popover from 'components/popover';
import ReactionsHoverWrapper from './reactions-hover-wrapper';
import ReactionButton from './reaction-button';
import ReactionList from './reaction-list';

export default class Reactions extends Component {
	state = {
		reactionIcon: '',
		reactionSlug: '',
		showingList: false,
		listDisplayBlocked: false,
	};

	onButtonClick = () => {
		const {
			reactionIcon,
			reactionSlug,
		} = this.state;

		this.setState( {
			reactionIcon: reactionIcon ? '' : DEFAULT_ICON,
			reactionSlug: reactionSlug ? '' : DEFAULT_SLUG,
			showingList: false,
			listDisplayBlocked: true,
		} );

		setTimeout( () => {
			this.setState( {
				listDisplayBlocked: false,
			} );
		}, 700 );
	}

	onButtonHover = () => {
		this.setState( {
			showingList: true,
		} );
	};

	onButtonUnhover = () => {
		this.setState( {
			showingList: false,
		} );
	};

	onSelected = ( icon, slug ) => {
		this.setState( {
			showingList: false,
			reactionIcon: icon,
			reactionSlug: slug,
		} );
	}

	setButtonRef = ( button ) => this.reactionButton = button;

	componentWillMount() {
		// @TODO any init / network calls, etc.
	}

	render() {
		const {
			reactionIcon,
			reactionSlug,
			showingList,
		} = this.state;

console.log(this.refs);

		return (
			<ReactionsHoverWrapper
				onHover={ this.onButtonHover }
				onUnhover={ this.onButtonUnhover }
			>
				<ReactionButton
					ref="reactionPopoverButton"
					icon={ reactionIcon || <Gridicon icon="heart-outline" /> }
					label={ reactionSlug }
					onButtonClick={ this.onButtonClick }
				/>
				<Popover
					context={ this.refs && this.refs.reactionPopoverButton }
					isVisible={ showingList }
					onClose={ function(){ console.log('popover closed') } }
					className="reactions__popover"
					position="top">{
						(
							showingList && console.log('showing popover') ||
							<ReactionList
								onSelected={ this.onSelected }
							/>
						)
					}
				</Popover>
			</ReactionsHoverWrapper>
		);
	}
}
