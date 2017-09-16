/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import wpcomFactory from 'lib/wp';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import ReactionList from './reaction-list';

export default class Reactions extends PureComponent {
	static propTypes = {
		onSelected: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.wpcom = wpcomFactory.undocumented();

		this.state = {
			reactionCommentId: props.reactionCommentId || false,
			reactionIcon: '',
			reactionSlug: '',
			showingList: false,
			listDisplayBlocked: false,
		};
	}

	toggleShowingList = () => this.setState( {
		showingList: ! this.state.showingList,
	} );

	onSelected = ( icon, slug ) => {
		const {
			siteId,
			postId,
		} = this.props;

		const {
			reactionCommentId,
		} = this.state;

		this.setState( {
			showingList: false,
			reactionIcon: icon,
			reactionSlug: slug,
		} );
		this.props.onSelected && this.props.onSelected( icon, slug );
		if ( ! ( siteId && postId ) ) {
			return;
		}
		if ( reactionCommentId ) {
			this.wpcom.updatePostReaction( siteId, reactionCommentId, icon, slug, this.onReactedToPost );
			return;
		}

		this.wpcom.reactToPost( siteId, postId, icon, slug, this.onReactedToPost );
	}

	onReactedToPost = ( error, response ) => {
		if ( ! ( response && response.ID ) ) {
			return;
		}

		this.setState( {
			reactionCommentId: response.ID,
		} );
	}

	/* TODO save post reactions for display purposes
	componentWillMount() {
		this.wpcom.getPostReactions( this.props.siteId, this.props.postId, ( reactions ) => {
			console.log( 'reactions', reactions );

		} );
	}

	componentWillUpdate( newState, newProps ) {
		// @TODO persist to localstorage here
	}
	*/

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
