/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:people:team-list' ),
	omit = require( 'lodash/omit' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	PeopleListItem = require( 'my-sites/people/people-list-item' ),
	SiteUsersFetcher = require( 'components/site-users-fetcher' ),
	UsersActions = require( 'lib/users/actions' ),
	InfiniteList = require( 'components/infinite-list' ),
	deterministicStringify = require( 'lib/deterministic-stringify' ),
	NoResults = require( 'my-sites/no-results' ),
	analytics = require( 'lib/analytics' ),
	PeopleListSectionHeader = require( 'my-sites/people/people-list-section-header' );

/**
 * Module Variables
 */
var Team = React.createClass( {
	displayName: 'Team',

	getInitialState: function() {
		return {
			bulkEditing: false
		};
	},

	isLastPage() {
		return this.props.totalUsers <= this.props.users.length + this.props.excludedUsers.length;
	},

	render: function() {
		var key = deterministicStringify( omit( this.props.fetchOptions, [ 'number', 'offset' ] ) ),
			headerText = this.translate( 'Team', { context: 'A navigation label.' } ),
			listClass = ( this.state.bulkEditing ) ? 'bulk-editing' : null,
			people;

		if ( this.props.fetchInitialized && ! this.props.users.length && this.props.fetchOptions.search && ! this.props.fetchingUsers ) {
			return (
				<NoResults
					image="/calypso/images/people/mystery-person.svg"
					text={
						this.translate( 'No results found for {{em}}%(searchTerm)s{{/em}}',
							{
								args: { searchTerm: this.props.search },
								components: { em: <em /> }
							}
						)
					} />
			);
		}

		if ( this.props.site && this.props.users.length ) {
			if ( this.props.search && this.props.totalUsers ) {
				headerText = this.translate(
					'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
					'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
					{
						count: this.props.users.length,
						args: {
							numberPeople: this.props.totalUsers,
							searchTerm: this.props.search
						},
						components: {
							em: <em />
						}
					}
				);
			}

			people = (
				<InfiniteList
					key={ key }
					items={ this.props.users }
					className="people-selector__infinite-list"
					ref="infiniteList"
					fetchingNextPage={ this.props.fetchingUsers }
					lastPage={ this.isLastPage() }
					fetchNextPage={ this._fetchNextPage }
					getItemRef={ this._getPersonRef }
					renderLoadingPlaceholders={ this._renderLoadingPeople }
					renderItem={ this._renderPerson }
					guessedItemHeight={ 126 }>
				</InfiniteList>
			);
		} else {
			people = this._renderLoadingPeople();
		}

		return (
			<div>
				<PeopleListSectionHeader
					label={ headerText }
					site={ this.props.site }
					count={ this.props.fetchingUsers || this.props.fetchOptions.search ? null : this.props.totalUsers } />
				<Card className={ listClass }>
					{ people }
				</Card>
				{ this.isLastPage() && <div className="infinite-scroll-end" /> }
			</div>
		);
	},

	_renderPerson: function( user ) {
		return (
			<PeopleListItem
				key={ user.ID }
				user={ user }
				type="user"
				site={ this.props.site }
				isSelectable={ this.state.bulkEditing } />
		);
	},

	_fetchNextPage: function() {
		var offset = this.props.users.length;
		var fetchOptions = Object.assign( {}, this.props.fetchOptions, { offset: offset } );
		analytics.ga.recordEvent( 'People', 'Fetched more users with infinite list', 'offset', offset );
		debug( 'fetching next batch of users' );
		UsersActions.fetchUsers( fetchOptions );
	},

	_getPersonRef: function( user ) {
		return 'user-' + user.ID;
	},

	_renderLoadingPeople: function() {
		return <PeopleListItem key="people-list-item-placeholder" />;
	}

} );

module.exports = React.createClass( {
	displayName: 'TeamList',

	render: function() {
		var fetchOptions = {
			siteId: this.props.site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: ( this.props.search ) ? '*' + this.props.search + '*' : null,
			role: this.props.role,
			search_columns: [ 'display_name', 'user_login' ]
		};

		Object.freeze( fetchOptions );

		return (
			<SiteUsersFetcher fetchOptions={ fetchOptions } >
				<Team { ...this.props } />
			</SiteUsersFetcher>
		);
	}
} );
