/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { groupBy } from 'lodash';
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
			reactionCommentId: props.reactionCommentId || localStorage[ this.storageKey ],
			reactionIcon: '',
			reactionSlug: '',
			showingList: false,
			listDisplayBlocked: false,
		};
	}

	getPostReactions = () => {
		const {
			postId,
			siteId,
		} = this.props;

		if ( ! ( siteId && postId ) ) {
			return;
		}

		return this.wpcom.getPostReactions( siteId, postId, 1, ( _, response ) => {
			const postReactions = response.comments || [];

			//console.log( `reactions: ${ siteId }:${ postId }`, { postReactions } );
			this.setState( {
				postReactions,
			} );
		} );
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

		/* const {
			postId,
			requestPostComments,
			siteId,
		} = this.props;*/

		this.setState( {
			reactionCommentId: response.ID,
		} );

		this.getPostReactions();
	}

	setStorageKey() {
		this.storageKey = `post_reaction_${ this.props.siteId }_${ this.props.postId }`;
	}

	componentWillMount() {
		const {
			postId,
			siteId,
		} = this.props;

		if ( ! ( siteId && postId ) ) {
			return;
		}

		this.setStorageKey();

		this.setState( {
			reactionCommentId: localStorage[ this.storageKey ],
		} );

		this.getPostReactions();
	}

	componentWillUpdate( nextProps, nextState ) {
		this.setStorageKey();

		if ( this.state.reactionCommentId !== nextState.reactionCommentId ) {
			localStorage.setItem( this.storageKey, nextState.reactionCommentId );
		}
	}

	getGroupedPostReactions = () => {
		return groupBy( this.state.postReactions, ( r ) => r.raw_content[ 0 ] );
	}

	render() {
		const {
			postReactions,
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
					<ReactionList onSelected={ this.onSelected } postReactions={ postReactions } />
				</Popover>
			</div>
		);
	}
}
