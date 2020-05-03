/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import PopoverMenuItem from 'components/popover/menu-item';
import UserItem from 'components/user';
import InfiniteList from 'components/infinite-list';
import { fetchUsers } from 'lib/users/actions';
import Search from 'components/search';
import { hasTouch } from 'lib/touch-detect';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:author-selector' );
let instance = 0;

class AuthorSwitcherShell extends React.Component {
	static propTypes = {
		users: PropTypes.array,
		fetchingUsers: PropTypes.bool,
		numUsersFetched: PropTypes.number,
		totalUsers: PropTypes.number,
		usersCurrentOffset: PropTypes.number,
		allowSingleUser: PropTypes.bool,
		popoverPosition: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.func } ),
		transformAuthor: PropTypes.func,
	};

	state = {
		showAuthorMenu: false,
	};

	UNSAFE_componentWillMount() {
		this.instance = instance;
		instance++;
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			! nextProps.fetchOptions.siteId ||
			nextProps.fetchOptions.siteId !== this.props.fetchOptions.siteId
		) {
			this.props.updateSearch( false );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( ! this.state.showAuthorMenu ) {
			return;
		}

		if ( ! prevState.showAuthorMenu && this.props.users.length > 10 && ! hasTouch() ) {
			setTimeout( () => this.refs.authorSelectorSearch.focus(), 0 );
		}
	}

	render() {
		const { users, fetchNameSpace } = this.props;
		const infiniteListKey = fetchNameSpace + this.instance;

		if ( ! this.userCanSelectAuthor() ) {
			return <span>{ this.props.children }</span>;
		}

		return (
			<span>
				<span
					className="author-selector__author-toggle"
					onClick={ this.toggleShowAuthor }
					tabIndex={ -1 }
					ref="author-selector-toggle"
				>
					{ this.props.children }
					<Gridicon ref="authorSelectorChevron" icon="chevron-down" size={ 16 } />
				</span>
				<Popover
					isVisible={ this.state.showAuthorMenu }
					onClose={ this.onClose }
					position={ this.props.popoverPosition }
					context={ this.refs && this.refs.authorSelectorChevron }
					onKeyDown={ this.onKeyDown }
					className="author-selector__popover popover"
					ignoreContext={ this.props.ignoreContext }
				>
					{ ( this.props.fetchOptions.search || users.length > 10 ) && (
						<Search
							compact
							onSearch={ this.onSearch }
							placeholder={ this.props.translate( 'Find Author…', { context: 'search label' } ) }
							delaySearch={ true }
							ref="authorSelectorSearch"
						/>
					) }
					{ this.props.fetchInitialized &&
					! users.length &&
					this.props.fetchOptions.search &&
					! this.props.fetchingUsers ? (
						this.noUsersFound()
					) : (
						<InfiniteList
							items={ users }
							key={ infiniteListKey }
							className="author-selector__infinite-list"
							ref={ this.setListContext }
							context={ this.state.listContext }
							fetchingNextPage={ this.props.fetchingUsers }
							guessedItemHeight={ 42 }
							lastPage={ this.isLastPage() }
							fetchNextPage={ this.fetchNextPage }
							getItemRef={ this.getAuthorItemGUID }
							renderLoadingPlaceholders={ this.renderLoadingAuthors }
							renderItem={ this.renderAuthor }
						/>
					) }
				</Popover>
			</span>
		);
	}

	isLastPage() {
		let usersLength = this.props.users.length;
		if ( this.props.exclude ) {
			usersLength += this.props.excludedUsers.length;
		}

		return this.props.totalUsers <= usersLength;
	}

	setListContext = ( infiniteListInstance ) => {
		this.setState( {
			listContext: ReactDom.findDOMNode( infiniteListInstance ),
		} );
	};

	userCanSelectAuthor() {
		const { users } = this.props;

		if ( this.props.fetchOptions.search ) {
			return true;
		}

		// no user choice
		if ( ! users || ! users.length || ( ! this.props.allowSingleUser && users.length === 1 ) ) {
			return false;
		}

		return true;
	}

	toggleShowAuthor = () => {
		this.setState( {
			showAuthorMenu: ! this.state.showAuthorMenu,
		} );
	};

	onClose = ( event ) => {
		const toggleElement = ReactDom.findDOMNode( this.refs[ 'author-selector-toggle' ] );

		if ( event && toggleElement.contains( event.target ) ) {
			// let toggleShowAuthor() handle this case
			return;
		}
		this.setState( {
			showAuthorMenu: false,
		} );
		this.props.updateSearch( false );
	};

	renderAuthor = ( rawAuthor ) => {
		const { transformAuthor } = this.props;
		const author = transformAuthor ? transformAuthor( rawAuthor ) : rawAuthor;
		const authorGUID = this.getAuthorItemGUID( author );

		return (
			<PopoverMenuItem
				className="author-selector__menu-item"
				onClick={ this.selectAuthor.bind( this, author ) }
				focusOnHover={ false }
				key={ authorGUID }
				tabIndex="-1"
			>
				<UserItem user={ author } />
			</PopoverMenuItem>
		);
	};

	noUsersFound() {
		return (
			<div className="author-selector__no-users">
				{ this.props.translate( 'No matching users found.' ) }
			</div>
		);
	}

	selectAuthor = ( author ) => {
		debug( 'assign author:', author );
		if ( this.props.onSelect ) {
			this.props.onSelect( author );
		}
		this.setState( {
			showAuthorMenu: false,
		} );
		this.props.updateSearch( false );
	};

	fetchNextPage = () => {
		const fetchOptions = Object.assign( {}, this.props.fetchOptions, {
			offset: this.props.users.length,
		} );
		debug( 'fetching next batch of authors' );
		fetchUsers( fetchOptions );
	};

	getAuthorItemGUID = ( author ) => {
		return 'author-item-' + author.ID;
	};

	renderLoadingAuthors = () => {
		return (
			<PopoverMenuItem disabled={ true } key="author-item-placeholder">
				<UserItem />
			</PopoverMenuItem>
		);
	};

	onSearch = ( searchTerm ) => {
		this.props.updateSearch( searchTerm );
	};
}

export default localize( AuthorSwitcherShell );
