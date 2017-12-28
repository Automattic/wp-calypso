/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Popover from 'client/components/popover';
import PopoverMenuItem from 'client/components/popover/menu-item';
import UserItem from 'client/components/user';
import InfiniteList from 'client/components/infinite-list';
import UsersActions from 'client/lib/users/actions';
import Search from 'client/components/search';
import { hasTouch } from 'client/lib/touch-detect';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:author-selector' );
let instance = 0;

const SwitcherShell = createReactClass( {
	displayName: 'AuthorSwitcherShell',

	propTypes: {
		users: PropTypes.array,
		fetchingUsers: PropTypes.bool,
		numUsersFetched: PropTypes.number,
		totalUsers: PropTypes.number,
		usersCurrentOffset: PropTypes.number,
		allowSingleUser: PropTypes.bool,
		popoverPosition: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.func } ),
	},

	getInitialState: function() {
		return {
			showAuthorMenu: false,
		};
	},

	componentWillMount: function() {
		this.instance = instance;
		instance++;
	},

	componentWillReceiveProps: function( nextProps ) {
		if (
			! nextProps.fetchOptions.siteId ||
			nextProps.fetchOptions.siteId !== this.props.fetchOptions.siteId
		) {
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
		const { users, fetchNameSpace } = this.props;
		const infiniteListKey = fetchNameSpace + this.instance;

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
					className="author-selector__popover popover"
					ignoreContext={ this.props.ignoreContext }
				>
					{ ( this.props.fetchOptions.search || users.length > 10 ) && (
						<Search
							compact
							onSearch={ this._onSearch }
							placeholder={ this.props.translate( 'Find Author…', { context: 'search label' } ) }
							delaySearch={ true }
							ref="authorSelectorSearch"
						/>
					) }
					{ this.props.fetchInitialized &&
					! users.length &&
					this.props.fetchOptions.search &&
					! this.props.fetchingUsers ? (
						this._noUsersFound()
					) : (
						<InfiniteList
							items={ users }
							key={ infiniteListKey }
							className="author-selector__infinite-list"
							ref={ this._setListContext }
							context={ this.state.listContext }
							fetchingNextPage={ this.props.fetchingUsers }
							guessedItemHeight={ 42 }
							lastPage={ this._isLastPage() }
							fetchNextPage={ this._fetchNextPage }
							getItemRef={ this._getAuthorItemGUID }
							renderLoadingPlaceholders={ this._renderLoadingAuthors }
							renderItem={ this._renderAuthor }
						/>
					) }
				</Popover>
			</span>
		);
	},

	_isLastPage: function() {
		let usersLength = this.props.users.length;
		if ( this.props.exclude ) {
			usersLength += this.props.excludedUsers.length;
		}

		return this.props.totalUsers <= usersLength;
	},

	_setListContext: function( infiniteListInstance ) {
		this.setState( {
			listContext: ReactDom.findDOMNode( infiniteListInstance ),
		} );
	},

	_userCanSelectAuthor: function() {
		const { users } = this.props;

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
			showAuthorMenu: ! this.state.showAuthorMenu,
		} );
	},

	_onClose: function( event ) {
		const toggleElement = ReactDom.findDOMNode( this.refs[ 'author-selector-toggle' ] );

		if ( event && toggleElement.contains( event.target ) ) {
			// let _toggleShowAuthor() handle this case
			return;
		}
		this.setState( {
			showAuthorMenu: false,
		} );
		this.props.updateSearch( false );
	},

	_renderAuthor: function( author ) {
		const authorGUID = this._getAuthorItemGUID( author );
		return (
			<PopoverMenuItem
				className="author-selector__menu-item"
				onClick={ this._selectAuthor.bind( this, author ) }
				focusOnHover={ false }
				key={ authorGUID }
				tabIndex="-1"
			>
				<UserItem user={ author } />
			</PopoverMenuItem>
		);
	},

	_noUsersFound: function() {
		return (
			<div className="author-selector__no-users">
				{ this.props.translate( 'No matching users found.' ) }
			</div>
		);
	},

	_selectAuthor: function( author ) {
		debug( 'assign author:', author );
		if ( this.props.onSelect ) {
			this.props.onSelect( author );
		}
		this.setState( {
			showAuthorMenu: false,
		} );
		this.props.updateSearch( false );
	},

	_fetchNextPage: function() {
		const fetchOptions = Object.assign( {}, this.props.fetchOptions, {
			offset: this.props.users.length,
		} );
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
	},
} );

export default localize( SwitcherShell );
