import { Button, Popover, Gridicon } from '@automattic/components';
import { withMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { intersection, difference, includes, flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import wrapWithClickOutside from 'react-click-outside';
import { connect } from 'react-redux';
import KeyedSuggestions from 'calypso/components/keyed-suggestions';
import Search from 'calypso/components/search';
import StickyPanel from 'calypso/components/sticky-panel';
import { getThemeFilters, getThemeFilterToTermTable } from 'calypso/state/themes/selectors';
import MagicSearchWelcome from './welcome';

import './style.scss';

//We want those taxonomies if they are used to be presented in this order
const preferredOrderOfTaxonomies = [ 'feature', 'layout', 'column', 'subject', 'style' ];

class ThemesMagicSearchCard extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		onSearch: PropTypes.func.isRequired,
		search: PropTypes.string,
		translate: PropTypes.func.isRequired,
		isBreakpointActive: PropTypes.bool, // comes from withMobileBreakpoint HOC
	};

	constructor( props ) {
		super( props );

		this.suggestionsRefs = {};

		this.state = {
			searchIsOpen: false,
			editedSearchElement: '',
			cursorPosition: 0,
			searchInput: this.props.search,
			isPopoverVisible: false,
		};
	}

	popoverButtonRef = createRef();

	setSuggestionsRefs = ( key ) => ( suggestionComponent ) => {
		this.suggestionsRefs[ key ] = suggestionComponent;
	};

	setSearchInputRef = ( search ) => ( this.searchInputRef = search );

	componentDidMount() {
		this.findTextForSuggestions( this.props.search );
	}

	togglePopover = () => {
		this.setState( ( oldState ) => ( { isPopoverVisible: ! oldState.isPopoverVisible } ) );
	};

	closePopover = () => {
		this.setState( { isPopoverVisible: false } );
	};

	onSearchOpen = () => {
		this.setState( { searchIsOpen: true } );
	};

	onSearchClose = () => {
		this.setState( { searchIsOpen: false } );
	};

	onKeyDown = ( event ) => {
		const txt = event.target.value;
		this.findTextForSuggestions( txt );

		let inputUpdated = false;
		//We need this logic because we are working togheter with different modules.
		//that provide suggestions to the input depending on what is currently in input
		const target = this.state.editedSearchElement !== '' ? 'suggestions' : 'welcome';
		if ( this.suggestionsRefs[ target ] ) {
			// handleKeyEvent functions return bool that infroms if suggestion was picked
			// We need that because we cannot rely on input state because it is updated
			// asynchronously and we are not able to observe what was changed during handleKeyEvent
			inputUpdated = this.suggestionsRefs[ target ].handleKeyEvent( event );
		}

		if ( event.key === 'Enter' && ! inputUpdated && this.isPreviousCharWhitespace() ) {
			this.searchInputRef.blur();
			this.setState( { searchIsOpen: false } );
		}
	};

	onClick = ( event ) => {
		this.findTextForSuggestions( event.target.value );
	};

	// Check if char before cursor in input is a space.
	isPreviousCharWhitespace = () => {
		const { value, selectionStart } = this.searchInputRef.searchInput;
		const cursorPosition = value.slice( 0, selectionStart ).length;
		return value[ cursorPosition - 1 ] === ' ';
	};

	findEditedTokenIndex = ( tokens, cursorPosition ) => {
		let tokenEnd = 0;
		for ( let i = 0; i < tokens.length; i++ ) {
			tokenEnd += tokens[ i ].length;

			const cursorIsInsideTheToken = cursorPosition < tokenEnd;
			if ( cursorIsInsideTheToken ) {
				// "" indicates full suggestion request
				return i;
			}

			const cursorAtEndOfTheToken = cursorPosition === tokenEnd;
			if ( cursorAtEndOfTheToken ) {
				//If token is whitespace only and we are at its end
				//maybe we are at the start of next token
				const tokenIsWhiteSpace = tokens[ i ].trim() === '';
				//if this one is white space only next
				//next one must be text
				const moreTokensExist = i < tokens.length - 1;
				if ( tokenIsWhiteSpace && moreTokensExist ) {
					return i + 1;
				}
				// "" indicates full suggestion request
				return i;
			}
			continue; // to the next token
		}

		return '';
	};

	findTextForSuggestions = ( input ) => {
		const val = input;
		window.requestAnimationFrame( () => {
			const selectionStart = this.searchInputRef.searchInput.selectionStart;
			const [ editedSearchElement, cursorPosition ] = this.computeEditedSearchElement(
				val,
				selectionStart
			);
			this.setState( { editedSearchElement, cursorPosition } );
		} );
	};

	computeEditedSearchElement = ( searchText, selectionStart ) => {
		const cursorPosition = searchText.slice( 0, selectionStart ).length;
		const tokens = searchText.split( /(\s+)/ );

		let editedSearchElement = '';

		// Get rid of empty match at end
		tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
		if ( tokens.length === 0 ) {
			return [ editedSearchElement, cursorPosition ];
		}
		const tokenIndex = this.findEditedTokenIndex( tokens, cursorPosition );
		editedSearchElement = tokens[ tokenIndex ].trim();
		return [ editedSearchElement, cursorPosition ];
	};

	insertSuggestion = ( suggestion ) => {
		const tokens = this.state.searchInput.split( /(\s+)/ );
		// Get rid of empty match at end
		tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
		const tokenIndex = this.findEditedTokenIndex( tokens, this.state.cursorPosition );
		// Check if we want to add additional sapce after suggestion so next suggestions card can be opened immediately
		const hasNextTokenFirstSpace =
			tokens[ tokenIndex + 1 ] && tokens[ tokenIndex + 1 ][ 0 ] === ' ';
		tokens[ tokenIndex ] = hasNextTokenFirstSpace ? suggestion : suggestion + ' ';
		return tokens.join( '' );
	};

	onSearchChange = ( input ) => {
		this.findTextForSuggestions( input );
		this.setState( { searchInput: input } );
	};

	searchTokens = ( input ) => {
		//We are not able to scroll overlay on Edge so just create empty div
		if ( typeof window !== 'undefined' && /(Edge)/.test( window.navigator.userAgent ) ) {
			return <div />;
		}

		const tokens = input.split( /(\s+)/ );

		return tokens.map( ( token, i ) => {
			if ( token.trim() === '' ) {
				return (
					<span className="themes-magic-search-card__search-white-space" key={ i }>
						{ token }
					</span>
				); // use shortid for key
			} else if ( includes( this.props.allValidFilters, token ) ) {
				const separator = ':';
				const [ taxonomy, filter ] = token.split( separator );
				const themesTokenTypeClass = classNames(
					'themes-magic-search-card__token',
					'themes-magic-search-card__token-type-' + taxonomy
				);
				return (
					<span className={ themesTokenTypeClass } key={ i }>
						<span className="themes-magic-search-card__token-taxonomy">{ taxonomy }</span>
						<span className="themes-magic-search-card__token-separator">{ separator }</span>
						<span className="themes-magic-search-card__token-filter">{ filter }</span>
					</span>
				);
			}
			return (
				<span className="themes-magic-search-card__search-text" key={ i }>
					{ token }
				</span>
			); // use shortid for key
		} );
	};

	updateInput = ( updatedInput ) => {
		this.setState( { searchInput: updatedInput } );
		this.searchInputRef.clear();
	};

	suggest = ( suggestion ) => {
		const updatedInput = this.insertSuggestion( suggestion );
		this.updateInput( updatedInput );
		this.focusOnInput();
	};

	// User has clicked on an item in the "Magic Welcome Bar" to add something like
	// "feature:" to their search text, which causes autocompletions to display.
	welcomeBarAddText = ( text ) => {
		let { searchInput } = this.state;
		// Since we are adding an unfinished feature to the search, like "feature:" or "column:",
		// remove other unfinished features from the search. The user doesn't want to have their
		// search bar reading "feature: column:" after clicking feature, then column.
		searchInput = searchInput.replace( /(feature|column|subject):(\s|$)/i, '' );

		// Add an extra leading space sometimes. If the user has "abcd" in
		// their bar and they click to add "feature:", we want "abcd feature:",
		// not "abcdfeature:".
		if ( searchInput.length > 0 && searchInput.slice( -1 ) !== ' ' ) {
			text = ' ' + text;
		}

		this.updateInput( searchInput + text );
		// Workaround for a strange bug: sometimes after clicking in the magic
		// welcome bar, when findTextForSuggestions() was running, it would
		// think the cursor is at the beginning of the input, causing no
		// suggestions to appear. Delaying this state transition seems to fix it.
		setTimeout( () => this.setState( { isPopoverVisible: false } ), 100 );
	};

	focusOnInput = () => {
		this.searchInputRef.focus();
	};

	clearSearch = () => {
		this.updateInput( '' );
		this.focusOnInput();
	};

	handleClickOutside() {
		this.setState( { searchIsOpen: false } );
	}

	handleClickInside = () => {
		this.focusOnInput();
	};

	render() {
		const { translate, filters } = this.props;
		const { isPopoverVisible } = this.state;

		const filtersKeys = [
			...intersection( preferredOrderOfTaxonomies, Object.keys( filters ) ),
			...difference( Object.keys( filters ), preferredOrderOfTaxonomies ),
		];

		// Check if we want to render suggestions or welcome banner
		const renderSuggestions =
			this.state.editedSearchElement !== '' && this.state.editedSearchElement.length > 2;

		const searchField = (
			<Search
				onSearch={ this.props.onSearch }
				initialValue={ this.state.searchInput }
				value={ this.state.searchInput }
				ref={ this.setSearchInputRef }
				placeholder={ translate(
					'Search by style or feature: portfolio, store, multiple menus, or…'
				) }
				analyticsGroup="Themes"
				delaySearch={ true }
				onSearchOpen={ this.onSearchOpen }
				onSearchClose={ this.onSearchClose }
				onSearchChange={ this.onSearchChange }
				onKeyDown={ this.onKeyDown }
				onClick={ this.onClick }
				overlayStyling={ this.searchTokens }
				hideClose={ true }
			>
				{ renderSuggestions && (
					<KeyedSuggestions
						ref={ this.setSuggestionsRefs( 'suggestions' ) }
						terms={ this.props.filters }
						input={ this.state.editedSearchElement }
						suggest={ this.suggest }
					/>
				) }
				{ this.state.searchInput !== '' && (
					<div className="themes-magic-search-card__icon">
						<Gridicon
							icon="cross"
							className="themes-magic-search-card__icon-close"
							tabIndex="0"
							onClick={ this.clearSearch }
							aria-controls={ 'search-component-magic-search' }
							aria-label={ translate( 'Clear Search' ) }
						/>
					</div>
				) }
				<div>
					<Button
						onClick={ this.togglePopover }
						className="components-button themes-magic-search-card__advanced-toggle"
						ref={ ( ref ) => ( this.popoverButtonRef = ref ) }
					>
						<Gridicon icon="cog" size={ 18 } />
						{ translate( 'Filters' ) }
					</Button>
					<Popover
						context={ this.popoverButtonRef }
						isVisible={ isPopoverVisible }
						onClose={ this.closePopover }
						position="bottom"
					>
						<MagicSearchWelcome
							ref={ this.setSuggestionsRefs( 'welcome' ) }
							taxonomies={ filtersKeys }
							topSearches={ [] }
							suggestionsCallback={ this.welcomeBarAddText }
						/>
					</Popover>
				</div>
			</Search>
		);

		const magicSearchClass = classNames( 'themes-magic-search', {
			'has-keyed-suggestions': this.state.searchIsOpen,
		} );

		const themesSearchCardClass = classNames( 'themes-magic-search-card', {
			'has-highlight': this.state.searchIsOpen,
		} );

		return (
			<div className={ magicSearchClass }>
				<StickyPanel>
					<div
						className={ themesSearchCardClass }
						role="presentation"
						data-tip-target="themes-search-card"
						onClick={ this.handleClickInside }
					>
						{ searchField }
					</div>
				</StickyPanel>
			</div>
		);
	}
}

// Magic Search only allows "feature", "column", "subject" theme attributes to be searched
// For simplicity and less user confusion.
const allowSomeThemeFilters = ( { feature, column, subject } ) => ( { feature, column, subject } );
const allowSomeAllValidFilters = ( filtersKeys ) =>
	intersection( filtersKeys, [ 'feature', 'column', 'subject' ] );

export default compose(
	connect( ( state ) => ( {
		filters: allowSomeThemeFilters( getThemeFilters( state ) ),
		allValidFilters: allowSomeAllValidFilters( Object.keys( getThemeFilterToTermTable( state ) ) ),
	} ) ),
	localize,
	wrapWithClickOutside,
	withMobileBreakpoint
)( ThemesMagicSearchCard );
