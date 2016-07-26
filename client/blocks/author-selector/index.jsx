/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:author-selector' ),
	trim = require( 'lodash/trim' );

/**
 * Internal dependencies
 */
var Popover = require( 'components/popover' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	SiteUsersFetcher = require( 'components/site-users-fetcher' ),
	UserItem = require( 'components/user' ),
	Gridicon = require( 'components/gridicon' ),
	InfiniteList = require( 'components/infinite-list' ),
	UsersActions = require( 'lib/users/actions' ),
	Search = require( 'components/search' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch;

/**
 * Module variables
 */
var instance = 0, SwitcherShell;

SwitcherShell = React.createClass( {
	displayName: 'AuthorSwitcherShell',
	propTypes: {
		users: React.PropTypes.array,
		fetchingUsers: React.PropTypes.bool,
		numUsersFetched: React.PropTypes.number,
		totalUsers: React.PropTypes.number,
		usersCurrentOffset: React.PropTypes.number,
		allowSingleUser: React.PropTypes.bool,
		popoverPosition: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			showAuthorMenu: false
		};
	},

	componentWillMount: function() {
		this.instance = instance;
		instance++;
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.fetchOptions.siteId || nextProps.fetchOptions.siteId !== this.props.fetchOptions.siteId ) {
			this.props.updateSearch( false );
		}
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( ! this.state.showAuthorMenu ) {
			return;
		}

		if ( ! prevState.showAuthorMenu && this.props.users.length > 10 && ! hasTouch() ) {
			setTimeout( () => this.refs.authorSelectorSearch.focus(), 0 );
		}
	},

	render: function() {
		var users = this.props.users,
			infiniteListKey = this.props.fetchNameSpace + this.instance;

		if ( ! this._userCanSelectAuthor() ) {
			return <span>{ this.props.children }</span>;
		}

		return (
			<span>
				<span
					className="author-selector__author-toggle"
					onClick={ this._toggleShowAuthor }
					tabIndex={ -1 }
					ref="author-selector-toggle"
				>
					{ this.props.children }
					<Gridicon ref="authorSelectorChevron" icon="chevron-down" size={ 16 } />
				</span>
				<Popover
					isVisible={ this.state.showAuthorMenu }
					onClose={ this._onClose }
					position={ this.props.popoverPosition }
					context={ this.refs && this.refs.authorSelectorChevron }
					onKeyDown={ this._onKeyDown }
					className="author-selector__popover popover">
					{ this.props.fetchOptions.search || users.length > 10 ?
						<Search
							onSearch={ this._onSearch }
							placeholder={ this.translate( 'Find Author…', { context: 'search label' } ) }
							delaySearch={ true }
							ref="authorSelectorSearch"
						/> :
					null }
					{ this.props.fetchInitialized && ! users.length && this.props.fetchOptions.search && ! this.props.fetchingUsers ?
						this._noUsersFound() :
						<InfiniteList
							items={ users }
							key={ infiniteListKey }
							namespace={ infiniteListKey }
							className="author-selector__infinite-list"
							ref={ this._setListContext }
							context={ this.state.listContext }
							fetchingNextPage={ this.props.fetchingUsers }
							guessedItemHeight={ 42 }
							lastPage={ this._isLastPage() }
							fetchNextPage={ this._fetchNextPage }
							getItemRef={ this._getAuthorItemGUID }
							renderLoadingPlaceholders={ this._renderLoadingAuthors }
							renderItem={ this._renderAuthor }>
						</InfiniteList>
					}
				</Popover>
			</span>
		);
	},

	_isLastPage: function() {
		var usersLength = this.props.users.length;
		if ( this.props.exclude ) {
			usersLength += this.props.excludedUsers.length;
		}

		return this.props.totalUsers <= usersLength;
	},

	_setListContext: function( infiniteListInstance ) {
		this.setState( {
			listContext: ReactDom.findDOMNode( infiniteListInstance )
		} );
	},

	_userCanSelectAuthor: function() {
		var users = this.props.users;

		if ( this.props.fetchOptions.search ) {
			return true;
		}

		// no user choice
		if ( ! users || ! users.length || ( ! this.props.allowSingleUser && users.length === 1 ) ) {
			return false;
		}

		return true;
	},

	_toggleShowAuthor: function() {
		this.setState( {
			showAuthorMenu: ! this.state.showAuthorMenu
		} );
	},

	_onClose: function( event ) {
		var toggleElement = ReactDom.findDOMNode( this.refs[ 'author-selector-toggle' ] );

		if ( event && toggleElement.contains( event.target ) ) {
			// let _toggleShowAuthor() handle this case
			return;
		}
		this.setState( {
			showAuthorMenu: false
		} );
		this.props.updateSearch( false );
	},

	_renderAuthor: function( author ) {
		var authorGUID = this._getAuthorItemGUID( author );
		return (
			<PopoverMenuItem
				className="author-selector__menu-item"
				onClick={ this._selectAuthor.bind( this, author ) }
				focusOnHover={ false }
				key={ authorGUID }
				ref={ authorGUID }
				tabIndex="-1">
				<UserItem user={ author }/>
			</PopoverMenuItem>
		);
	},

	_noUsersFound: function() {
		return (
			<div className="author-selector__no-users">
				{ this.translate( 'No matching users found.' ) }
			</div>
		);
	},

	_selectAuthor: function( author ) {
		debug( 'assign author:', author );
		if ( this.props.onSelect ) {
			this.props.onSelect( author );
		}
		this.setState( {
			showAuthorMenu: false
		} );
		this.props.updateSearch( false );
	},

	_fetchNextPage: function() {
		var fetchOptions = Object.assign( {}, this.props.fetchOptions, { offset: this.props.users.length } );
		debug( 'fetching next batch of authors' );
		UsersActions.fetchUsers( fetchOptions );
	},

	_getAuthorItemGUID: function( author ) {
		return 'author-item-' + author.ID;
	},

	_renderLoadingAuthors: function() {
		return (
			<PopoverMenuItem disabled={ true } key="author-item-placeholder">
				<UserItem />
			</PopoverMenuItem>
		);
	},

	_onSearch: function( searchTerm ) {
		this.props.updateSearch( searchTerm );
	}
} );

module.exports = React.createClass( {
	displayName: 'AuthorSelector',
	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		onSelect: React.PropTypes.func,
		exclude: React.PropTypes.arrayOf( React.PropTypes.number ),
		allowSingleUser: React.PropTypes.bool,
		popoverPosition: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			search: ''
		};
	},

	getDefaultProps: function() {
		return {
			showAuthorMenu: false,
			onClose: function() {},
			allowSingleUser: false,
			popoverPosition: 'bottom left'
		};
	},

	componentDidMount: function() {
		debug( 'AuthorSelector mounted' );
	},

	render: function() {
		var searchString = this.state.search || '',
			fetchOptions;

		searchString = trim( searchString );

		fetchOptions = {
			siteId: this.props.siteId,
			order: 'ASC',
			order_by: 'display_name',
			number: 50
		};

		if ( searchString ) {
			fetchOptions.number = 20; // make search a little faster
			fetchOptions.search = searchString;
			fetchOptions.search_columns = [ 'user_login', 'display_name' ];
		}

		Object.freeze( fetchOptions );
		return (
			<SiteUsersFetcher fetchOptions={ fetchOptions } exclude={ this.props.exclude }>
				<SwitcherShell { ...this.props } updateSearch={ this._updateSearch } />
			</SiteUsersFetcher>
		);
	},

	_updateSearch: function( searchTerm ) {
		searchTerm = searchTerm ? '*' + searchTerm + '*' : '';
		this.setState( {
			search: searchTerm
		} );
	}
} );
