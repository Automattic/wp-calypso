/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import deterministicStringify from 'fast-json-stable-stringify';
import { omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import PeopleListItem from 'my-sites/people/people-list-item';
import { Card, Button } from '@automattic/components';
import classNames from 'classnames';
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
import { gaRecordEvent } from 'lib/analytics/ga';
import ListEnd from 'components/list-end';
import { preventWidows } from 'lib/formatting';

/**
 * Stylesheet dependencies
 */
import './style.scss';

const maxFollowers = 1000;

const Followers = localize(
	class FollowersComponent extends Component {
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
			gaRecordEvent( 'People', analyticsAction, 'page', page );
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
				accepted => {
					if ( accepted ) {
						gaRecordEvent(
							'People',
							'Clicked Remove Button In Remove ' + listType + ' Confirmation'
						);
						( 'email' === this.props.type
							? EmailFollowersActions
							: FollowersActions
						).removeFollower( this.props.site.ID, follower );
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
				maxFollowers <= this.props.followers.length
			);
		}

		render() {
			const key = deterministicStringify( omit( this.props.fetchOptions, [ 'max', 'page' ] ) ),
				listClass = classNames( {
					'bulk-editing': this.state.bulkEditing,
					'people-invites__invites-list': true,
				} );

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
						isPlaceholder={ this.props.fetching || this.props.fetchOptions.search }
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
		<DataComponent fetchOptions={ fetchOptions } site={ props.site } type={ props.type }>
			<Followers />
		</DataComponent>
	);
};

export default FollowersList;
