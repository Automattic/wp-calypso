/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	omit = require( 'lodash/omit' ),
	debug = require( 'debug' )( 'calypso:my-sites:people:followers-list' );

/**
 * Internal dependencies
 */
var PeopleListItem = require( 'my-sites/people/people-list-item' ),
	Card = require( 'components/card' ),
	SectionHeader = require( 'components/section-header' ),
	FollowersActions = require( 'lib/followers/actions' ),
	EmailFollowersActions = require( 'lib/email-followers/actions' ),
	InfiniteList = require( 'components/infinite-list' ),
	FollowersData = require( 'components/data/followers-data' ),
	EmailFollowersData = require( 'components/data/email-followers-data' ),
	NoResults = require( 'my-sites/no-results' ),
	EmptyContent = require( 'components/empty-content' ),
	FollowersStore = require( 'lib/followers/store' ),
	EmailFollowersStore = require( 'lib/email-followers/store' ),
	deterministicStringify = require( 'lib/deterministic-stringify' ),
	accept = require( 'lib/accept' ),
	analytics = require( 'analytics' );

const maxFollowers = 1000;

let Followers = React.createClass( {

	displayName: 'Followers',

	getInitialState: function() {
		return {
			bulkEditing: false
		};
	},

	mixins: [ PureRenderMixin ],

	renderPlaceholders() {
		return <PeopleListItem key="people-list-item-placeholder"/>;
	},

	fetchNextPage() {
		let actions = 'email' === this.props.type ? EmailFollowersActions : FollowersActions,
			store = 'email' === this.props.type ? EmailFollowersStore : FollowersStore,
			page = this.props.currentPage + 1,
			paginationData = store.getPaginationData( this.props.fetchOptions ),
			analyticsAction = 'email' === this.props.type
				? 'Fetched more email followers with infinite list'
				: 'Fetched more followers with infinite list';

		if ( paginationData && paginationData.followersCurrentPage ) {
			page = paginationData.followersCurrentPage + 1;
		}

		actions.fetchFollowers( Object.assign( this.props.fetchOptions, { page } ) );
		analytics.ga.recordEvent( 'People', analyticsAction, 'page', page );
		debug( 'Fetching next page: ' + page );
	},

	removeFollower: function( follower ) {
		let listType = 'email' === this.props.type ? 'Email Follower' : 'Follower';
		analytics.ga.recordEvent( 'People', 'Clicked Remove Follower Button On' + listType + ' list' );
		accept( (
			<div>
				<p>
				{
					this.translate(
						'If removed, this follower will stop receiving notifications about this site, unless they re-follow.'
					)
				}
				</p>
				<p>
					{ this.translate( 'Would you still like to remove this follower?' ) }
				</p>
			</div>
			),
			accepted => {
				if ( accepted ) {
					analytics.ga.recordEvent( 'People', 'Clicked Remove Button In Remove ' + listType + ' Confirmation' );
					( 'email' === this.props.type ? EmailFollowersActions : FollowersActions ).removeFollower( this.props.site.ID, follower );
				} else {
					analytics.ga.recordEvent( 'People', 'Clicked Cancel Button In Remove ' + listType + ' Confirmation' );
				}
			},
			this.translate( 'Remove', { context: 'Confirm Remove follower button text.' } )
		);
	},

	renderFollower( follower ) {
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
	},

	getFollowerRef( follower ) {
		return 'follower-' + follower.ID;
	},

	noFollowerSearchResults() {
		return this.props.fetchInitialized &&
			this.props.fetchOptions.search &&
			! this.props.followers.length &&
			! this.props.fetching;
	},

	siteHasNoFollowers() {
		return ! this.props.followers.length && ! this.props.fetching;
	},

	isLastPage() {
		return this.props.totalFollowers <= this.props.followers.length || maxFollowers <= this.props.followers.length;
	},

	render() {
		let key = deterministicStringify( omit( this.props.fetchOptions, [ 'max', 'page' ] ) ),
			headerText = this.props.label,
			listClass = ( this.state.bulkEditing ) ? 'bulk-editing' : null,
			followers,
			emptyTitle;

		if ( this.noFollowerSearchResults() ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={
						this.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}',
							{
								args: { searchTerm: this.props.fetchOptions.search },
								components: { em: <em /> }
							}
						)
					} />
			);
		}

		if ( this.siteHasNoFollowers() ) {
			if ( this.props.fetchOptions && 'email' === this.props.fetchOptions.type ) {
				emptyTitle = this.translate( "You don't have any email followers yet." )
			} else {
				emptyTitle = this.translate( "You don't have any followers yet." )
			}
			return (
				<EmptyContent title={ emptyTitle } />
			);
		}

		if ( this.props.followers.length ) {
			if ( this.props.fetchOptions.search && this.props.totalFollowers ) {
				headerText = this.translate(
					'%(numberPeople)d Follower Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d Followers Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: this.props.followers.length,
						args: {
							numberPeople: this.props.totalFollowers,
							searchTerm: this.props.fetchOptions.search
						},
						components: {
							em: <em />
						}
					}
				);
			}

			let infiniteListConditionals = {
				fetchingNextPage: this.props.fetching,
				lastPage: this.isLastPage()
			};

			debug( 'Infinite list conditionals: ' + JSON.stringify( infiniteListConditionals ) );

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
		return (
			<div>
				<SectionHeader label={ headerText } count={ this.props.fetching || this.props.fetchOptions.search ? undefined : this.props.totalFollowers } />
				<Card className={ listClass }>
					{ followers }
				</Card>
				{ this.isLastPage() && <div className="infinite-scroll-end" /> }
			</div>
		);
	}
} );

module.exports = React.createClass( {
	displayName: 'FollowersList',

	mixins: [ PureRenderMixin ],

	render() {
		let DataComponent;
		let fetchOptions = {
			max: 100,
			page: 1,
			search: ( this.props.search ) && this.props.search,
			siteId: this.props.site.ID
		};

		if ( 'email' === this.props.type ) {
			DataComponent = EmailFollowersData;
			fetchOptions.type = 'email';
		} else {
			DataComponent = FollowersData;
		}

		return (
			<DataComponent
				fetchOptions={ fetchOptions }
				site={ this.props.site }
				label={ this.props.label }
				type={ this.props.type }
			>
				<Followers />
			</DataComponent>
		);
	}
} );
