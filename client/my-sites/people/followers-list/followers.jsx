/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import deterministicStringify from 'fast-json-stable-stringify';
import { omit } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { Card, Button } from '@automattic/components';
import classNames from 'classnames';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import InfiniteList from 'calypso/components/infinite-list';
import NoResults from 'calypso/my-sites/no-results';
import EmptyContent from 'calypso/components/empty-content';
import accept from 'calypso/lib/accept';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import ListEnd from 'calypso/components/list-end';
import { preventWidows } from 'calypso/lib/formatting';
import {
	getFollowersForQuery,
	isFetchingFollowersForQuery,
	getTotalFollowersForQuery,
} from 'calypso/state/followers/selectors';
import { requestRemoveFollower } from 'calypso/state/followers/actions';
import { addQueryArgs } from 'calypso/lib/url';

const MAX_FOLLOWERS = 1000;

class Followers extends Component {
	constructor() {
		super();

		this.infiniteList = React.createRef();
	}

	state = {
		bulkEditing: false,
	};

	renderPlaceholders() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	}

	fetchNextPage = () => {
		const analyticsAction =
			'email' === this.props.type
				? 'Fetched more email followers with infinite list'
				: 'Fetched more followers with infinite list';

		this.props.incrementPage();
		gaRecordEvent( 'People', analyticsAction, 'page', this.props.currentPage + 1 );
	};

	removeFollower( follower ) {
		const listType = 'email' === this.props.type ? 'Email Follower' : 'Follower';
		gaRecordEvent( 'People', 'Clicked Remove Follower Button On' + listType + ' list' );
		accept(
			<div>
				<p>
					{ this.props.translate(
						'Removing followers makes them stop receiving updates from your site. If they choose to, they can still visit your site, and follow it again.'
					) }
				</p>
			</div>,
			( accepted ) => {
				if ( accepted ) {
					gaRecordEvent(
						'People',
						'Clicked Remove Button In Remove ' + listType + ' Confirmation'
					);
					this.props.requestRemoveFollower( this.props.site.ID, follower, this.props.type );
				} else {
					gaRecordEvent(
						'People',
						'Clicked Cancel Button In Remove ' + listType + ' Confirmation'
					);
				}
			},
			this.props.translate( 'Remove', { context: 'Confirm Remove follower button text.' } )
		);
	}

	renderFollower = ( follower ) => {
		return (
			<PeopleListItem
				key={ follower.ID }
				user={ follower }
				type="follower"
				site={ this.props.site }
				isSelectable={ this.state.bulkEditing }
				onRemove={ () => this.removeFollower( follower ) }
			/>
		);
	};

	getFollowerRef = ( follower ) => {
		return 'follower-' + follower.ID;
	};

	noFollowerSearchResults() {
		return (
			this.props.fetchInitialized &&
			this.props.query.search &&
			! this.props.followers.length &&
			! this.props.fetching
		);
	}

	siteHasNoFollowers() {
		return ! this.props.followers.length && ! this.props.fetching;
	}

	renderInviteFollowersAction( isPrimary = true ) {
		const { site, translate } = this.props;

		return (
			<Button primary={ isPrimary } href={ `/people/new/${ site.domain }` }>
				<Gridicon icon="user-add" />
				<span>{ translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }</span>
			</Button>
		);
	}

	isLastPage() {
		return (
			this.props.totalFollowers <= this.props.followers.length ||
			MAX_FOLLOWERS <= this.props.followers.length
		);
	}

	render() {
		const key = deterministicStringify( omit( this.props.query, [ 'max', 'page' ] ) );
		const listClass = classNames( {
			'bulk-editing': this.state.bulkEditing,
			'people-invites__invites-list': true,
		} );

		if ( this.noFollowerSearchResults() ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={ this.props.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
						args: { searchTerm: this.props.query.search },
						components: { em: <em /> },
					} ) }
				/>
			);
		}

		let emptyTitle;
		if ( this.siteHasNoFollowers() ) {
			if ( this.props.query && 'email' === this.props.query.type ) {
				emptyTitle = preventWidows(
					this.props.translate( 'No one is following you by email yet.' )
				);
			} else {
				emptyTitle = preventWidows( this.props.translate( 'No WordPress.com followers yet.' ) );
			}
			return <EmptyContent title={ emptyTitle } action={ this.renderInviteFollowersAction() } />;
		}

		let headerText;
		if ( this.props.totalFollowers ) {
			headerText = this.props.translate(
				'You have %(number)d follower',
				'You have %(number)d followers',
				{
					args: { number: this.props.totalFollowers },
					count: this.props.totalFollowers,
				}
			);

			if ( this.props.type === 'email' ) {
				headerText = this.props.translate(
					'You have %(number)d follower receiving updates by email',
					'You have %(number)d followers receiving updates by email',
					{
						args: { number: this.props.totalFollowers },
						count: this.props.totalFollowers,
					}
				);
			}
		}

		let followers;
		if ( this.props.followers.length ) {
			if ( this.props.query.search && this.props.totalFollowers ) {
				headerText = this.props.translate(
					'%(numberPeople)d Follower Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d Followers Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: this.props.followers.length,
						args: {
							numberPeople: this.props.totalFollowers,
							searchTerm: this.props.query.search,
						},
						components: {
							em: <em />,
						},
					}
				);
			}

			const infiniteListConditionals = {
				fetchingNextPage: this.props.fetching,
				lastPage: this.isLastPage(),
			};

			followers = (
				<InfiniteList
					{ ...infiniteListConditionals }
					key={ key }
					items={ this.props.followers }
					className="followers-list__infinite is-people"
					ref={ this.infiniteList }
					fetchNextPage={ this.fetchNextPage }
					getItemRef={ this.getFollowerRef }
					renderLoadingPlaceholders={ this.renderPlaceholders }
					renderItem={ this.renderFollower }
					guessedItemHeight={ 126 }
				/>
			);
		} else {
			followers = this.renderPlaceholders();
		}

		const canDownloadCsv = this.props.query.type === 'email' && !! this.props.site;
		const downloadListLink = canDownloadCsv
			? addQueryArgs(
					{ page: 'stats', blog: this.props.site.ID, blog_subscribers: 'csv', type: 'email' },
					'https://dashboard.wordpress.com/wp-admin/index.php'
			  )
			: null;

		return (
			<>
				<PeopleListSectionHeader
					isFollower
					isPlaceholder={ this.props.fetching || this.props.query.search }
					label={ headerText }
					site={ this.props.site }
				>
					{ downloadListLink && (
						<Button href={ downloadListLink } compact>
							{ this.props.translate( 'Download Data as CSV' ) }
						</Button>
					) }
				</PeopleListSectionHeader>
				<Card className={ listClass }>{ followers }</Card>
				{ this.isLastPage() && <ListEnd /> }
			</>
		);
	}
}

const mapStateToProps = ( state, { query } ) => ( {
	followers: getFollowersForQuery( state, query ),
	fetching: isFetchingFollowersForQuery( state, query ),
	totalFollowers: getTotalFollowersForQuery( state, query ),
} );

export default connect( mapStateToProps, { requestRemoveFollower } )( localize( Followers ) );
