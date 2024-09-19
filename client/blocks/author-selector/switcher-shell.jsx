import { Gridicon, Popover } from '@automattic/components';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import ReactDom from 'react-dom';
import AsyncLoad from 'calypso/components/async-load';
import InfiniteList from 'calypso/components/infinite-list';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import UserItem from 'calypso/components/user';
import { hasTouch } from 'calypso/lib/touch-detect';
import 'calypso/components/popover-menu/style.scss';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:author-selector' );

class AuthorSwitcherShell extends Component {
	static propTypes = {
		users: PropTypes.array,
		allowSingleUser: PropTypes.bool,
		popoverPosition: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.func } ),
		transformAuthor: PropTypes.func,
	};

	state = {
		showAuthorMenu: false,
	};

	authorSelectorSearchRef = createRef();
	authorSelectorToggleRef = createRef();
	authorSelectorChevronRef = createRef();

	render() {
		const { users } = this.props;

		if ( ! this.userCanSelectAuthor() ) {
			return <span>{ this.props.children }</span>;
		}

		return (
			<span>
				<span
					className="author-selector__author-toggle"
					onClick={ this.toggleShowAuthor }
					onKeyDown={ this.toggleShowAuthor }
					role="button"
					tabIndex={ -1 }
					ref={ this.authorSelectorToggleRef }
				>
					{ this.props.children }
					<Gridicon ref={ this.authorSelectorChevronRef } icon="chevron-down" size={ 18 } />
				</span>
				<Popover
					isVisible={ this.state.showAuthorMenu }
					onClose={ this.onClose }
					position={ this.props.popoverPosition }
					context={ this.authorSelectorChevronRef.current }
					onKeyDown={ this.onKeyDown }
					className="author-selector__popover popover"
					ignoreContext={ this.props.ignoreContext }
				>
					{ ( this.props.search || users.length > 10 ) && (
						<AsyncLoad
							require="@automattic/search"
							compact
							onSearch={ this.props.updateSearch }
							placeholder={ this.props.translate( 'Find Author…', { context: 'search label' } ) }
							delaySearch
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus={ ! hasTouch() }
						/>
					) }
					{ ! users.length && this.props.search && ! this.props.isLoading ? (
						this.noUsersFound()
					) : (
						<InfiniteList
							items={ users }
							key={ this.props.listKey }
							className="author-selector__infinite-list"
							ref={ this.setListContext }
							context={ this.state.listContext }
							fetchingNextPage={ this.props.isFetchingNextPage }
							guessedItemHeight={ 42 }
							lastPage={ ! this.props.hasNextPage }
							fetchNextPage={ this.props.fetchNextPage }
							getItemRef={ this.getAuthorItemGUID }
							renderLoadingPlaceholders={ this.renderLoadingAuthors }
							renderItem={ this.renderAuthor }
						/>
					) }
				</Popover>
			</span>
		);
	}

	setListContext = ( infiniteListInstance ) => {
		this.setState( {
			listContext: ReactDom.findDOMNode( infiniteListInstance ),
		} );
	};

	userCanSelectAuthor() {
		const { users } = this.props;

		if ( this.props.search ) {
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
		const toggleElement = ReactDom.findDOMNode( this.authorSelectorToggleRef.current );

		if ( event && toggleElement.contains( event.target ) ) {
			// let toggleShowAuthor() handle this case
			return;
		}
		this.setState( {
			showAuthorMenu: false,
		} );
		this.props.updateSearch( '' );
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
		this.props.updateSearch( '' );
	};

	getAuthorItemGUID = ( author ) => {
		return 'author-item-' + author.ID;
	};

	renderLoadingAuthors = () => {
		return (
			<PopoverMenuItem disabled key="author-item-placeholder">
				<UserItem />
			</PopoverMenuItem>
		);
	};
}

export default localize( AuthorSwitcherShell );
