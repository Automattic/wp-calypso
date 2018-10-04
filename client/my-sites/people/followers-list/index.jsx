/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import deterministicStringify from 'json-stable-stringify';
import { omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PeopleListItem from 'my-sites/people/people-list-item';
import Card from 'components/card';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import FollowersActions from 'lib/followers/actions';
import EmailFollowersActions from 'lib/email-followers/actions';
import InfiniteList from 'components/infinite-list';
import FollowersData from 'components/data/followers-data';
import EmailFollowersData from 'components/data/email-followers-data';
import NoResults from 'my-sites/no-results';
import EmptyContent from 'components/empty-content';
import FollowersStore from 'lib/followers/store';
import EmailFollowersStore from 'lib/email-followers/store';
import accept from 'lib/accept';
import analytics from 'lib/analytics';
import Button from 'components/button';
import ListEnd from 'components/list-end';

const maxFollowers = 1000;

const Followers = localize(
	class FollowersComponent extends Component {
		state = {
			bulkEditing: false,
		};

		renderPlaceholders() {
			return <PeopleListItem key="people-list-item-placeholder" />;
		}

		fetchNextPage = () => {
			const actions = 'email' === this.props.type ? EmailFollowersActions : FollowersActions,
				store = 'email' === this.props.type ? EmailFollowersStore : FollowersStore,
				paginationData = store.getPaginationData( this.props.fetchOptions ),
				analyticsAction =
					'email' === this.props.type
						? 'Fetched more email followers with infinite list'
						: 'Fetched more followers with infinite list';

			let page = this.props.currentPage + 1;
			if ( paginationData && paginationData.followersCurrentPage ) {
				page = paginationData.followersCurrentPage + 1;
			}

			actions.fetchFollowers( Object.assign( this.props.fetchOptions, { page } ) );
			analytics.ga.recordEvent( 'People', analyticsAction, 'page', page );
		};

		removeFollower( follower ) {
			const listType = 'email' === this.props.type ? 'Email Follower' : 'Follower';
			analytics.ga.recordEvent(
				'People',
				'Clicked Remove Follower Button On' + listType + ' list'
			);
			accept(
				<div>
					<p>
						{ this.props.translate(
							'If removed, this follower will stop receiving notifications about this site, unless they re-follow.'
						) }
					</p>
					<p>{ this.props.translate( 'Would you still like to remove this follower?' ) }</p>
				</div>,
				accepted => {
					if ( accepted ) {
						analytics.ga.recordEvent(
							'People',
							'Clicked Remove Button In Remove ' + listType + ' Confirmation'
						);
						( 'email' === this.props.type
							? EmailFollowersActions
							: FollowersActions
						).removeFollower( this.props.site.ID, follower );
					} else {
						analytics.ga.recordEvent(
							'People',
							'Clicked Cancel Button In Remove ' + listType + ' Confirmation'
						);
					}
				},
				this.props.translate( 'Remove', { context: 'Confirm Remove follower button text.' } )
			);
		}

		renderFollower = follower => {
			const removeFollower = () => {
				this.removeFollower( follower );
			};

			return (
				<PeopleListItem
					key={ follower.ID }
					user={ follower }
					type="follower"
					site={ this.props.site }
					isSelectable={ this.state.bulkEditing }
					onRemove={ removeFollower }
				/>
			);
		};

		getFollowerRef = follower => {
			return 'follower-' + follower.ID;
		};

		noFollowerSearchResults() {
			return (
				this.props.fetchInitialized &&
				this.props.fetchOptions.search &&
				! this.props.followers.length &&
				! this.props.fetching
			);
		}

		siteHasNoFollowers() {
			return ! this.props.followers.length && ! this.props.fetching;
		}

		isLastPage() {
			return (
				this.props.totalFollowers <= this.props.followers.length ||
				maxFollowers <= this.props.followers.length
			);
		}

		render() {
			const key = deterministicStringify( omit( this.props.fetchOptions, [ 'max', 'page' ] ) ),
				listClass = this.state.bulkEditing ? 'bulk-editing' : null;

			if ( this.noFollowerSearchResults() ) {
				return (
					<NoResults
						image="/calypso/images/people/mystery-person.svg"
						text={ this.props.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}', {
							args: { searchTerm: this.props.fetchOptions.search },
							components: { em: <em /> },
						} ) }
					/>
				);
			}

			let emptyTitle;
			if ( this.siteHasNoFollowers() ) {
				if ( this.props.fetchOptions && 'email' === this.props.fetchOptions.type ) {
					emptyTitle = this.props.translate( "You don't have any email followers yet." );
				} else {
					emptyTitle = this.props.translate( "You don't have any followers yet." );
				}
				return <EmptyContent title={ emptyTitle } />;
			}

			let headerText = this.props.label;
			let followers;
			if ( this.props.followers.length ) {
				if ( this.props.fetchOptions.search && this.props.totalFollowers ) {
					headerText = this.props.translate(
						'%(numberPeople)d Follower Matching {{em}}"%(searchTerm)s"{{/em}}',
						'%(numberPeople)d Followers Matching {{em}}"%(searchTerm)s"{{/em}}',
						{
							count: this.props.followers.length,
							args: {
								numberPeople: this.props.totalFollowers,
								searchTerm: this.props.fetchOptions.search,
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
						className="people-selector__infinite-list"
						ref="infiniteList"
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

			const downloadListLink =
				this.props.fetchOptions.type === 'email' && !! this.props.site
					? 'https://dashboard.wordpress.com/wp-admin/index.php?page=stats&blog=' +
					  this.props.site.ID +
					  '&blog_subscribers=csv&type=email'
					: null;

			return (
				<div>
					<PeopleListSectionHeader
						isFollower
						label={ headerText }
						site={ this.props.site }
						count={
							this.props.fetching || this.props.fetchOptions.search
								? null
								: this.props.totalFollowers
						}
					>
						{ downloadListLink && (
							<Button href={ downloadListLink } compact>
								{ this.props.translate( 'Download Data as CSV' ) }
							</Button>
						) }
					</PeopleListSectionHeader>
					<Card className={ listClass }>{ followers }</Card>
					{ this.isLastPage() && <ListEnd /> }
				</div>
			);
		}
	}
);

const FollowersList = props => {
	let DataComponent;
	const fetchOptions = {
		max: 100,
		page: 1,
		search: props.search && props.search,
		siteId: props.site.ID,
	};

	if ( 'email' === props.type ) {
		DataComponent = EmailFollowersData;
		fetchOptions.type = 'email';
	} else {
		DataComponent = FollowersData;
	}

	return (
		<DataComponent
			fetchOptions={ fetchOptions }
			site={ props.site }
			label={ props.label }
			type={ props.type }
		>
			<Followers />
		</DataComponent>
	);
};

export default FollowersList;
