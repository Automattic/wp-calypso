import { Spinner } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import { Icon, search, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import i18n from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import TranslatableString from 'calypso/components/translatable/proptype';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

import './style.scss';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;
const noop = () => {};

export const SEARCH_MODE_WHEN_TYPING = 'when-typing';
export const SEARCH_MODE_ON_ENTER = 'on-enter';

function keyListener( methodToCall, event ) {
	switch ( event.key ) {
		case ' ':
		case 'Enter':
			this[ methodToCall ]( event );
			break;
	}
}

class Search extends Component {
	static propTypes = {
		additionalClasses: PropTypes.string,
		initialValue: PropTypes.string,
		value: PropTypes.string,
		placeholder: TranslatableString,
		pinned: PropTypes.bool,
		delaySearch: PropTypes.bool,
		delayTimeout: PropTypes.number,
		describedBy: PropTypes.string,
		onSearch: PropTypes.func.isRequired,
		onSearchChange: PropTypes.func,
		onSearchOpen: PropTypes.func,
		onSearchClose: PropTypes.func,
		analyticsGroup: PropTypes.string,
		overlayStyling: PropTypes.func,
		autoFocus: PropTypes.bool,
		disabled: PropTypes.bool,
		onKeyDown: PropTypes.func,
		onClick: PropTypes.func,
		disableAutocorrect: PropTypes.bool,
		onBlur: PropTypes.func,
		searching: PropTypes.bool,
		isOpen: PropTypes.bool,
		dir: PropTypes.oneOf( [ 'ltr', 'rtl' ] ),
		fitsContainer: PropTypes.bool,
		maxLength: PropTypes.number,
		minLength: PropTypes.number,
		hideClose: PropTypes.bool,
		hideFocus: PropTypes.bool,
		compact: PropTypes.bool,
		hideOpenIcon: PropTypes.bool,
		inputLabel: PropTypes.string,
		searchMode: PropTypes.string,
		applySearch: PropTypes.bool,
	};

	static defaultProps = {
		pinned: false,
		delaySearch: false,
		delayTimeout: SEARCH_DEBOUNCE_MS,
		autoFocus: false,
		disabled: false,
		describedBy: null,
		onSearchChange: noop,
		onSearchOpen: noop,
		onSearchClose: noop,
		onKeyDown: noop,
		onClick: noop,
		//undefined value for overlayStyling is an optimization that will
		//disable overlay scrolling calculation when no overlay is provided.
		overlayStyling: undefined,
		disableAutocorrect: false,
		searching: false,
		isOpen: false,
		dir: undefined,
		fitsContainer: false,
		hideClose: false,
		hideFocus: false,
		compact: false,
		hideOpenIcon: false,
		searchMode: SEARCH_MODE_WHEN_TYPING,
		applySearch: false,
	};

	constructor( props ) {
		super( props );

		this.instanceId = crypto.randomUUID();

		this.state = {
			keyword: props.initialValue || '',
			isOpen: !! props.isOpen,
			hasFocus: props.autoFocus,
		};

		this.closeListener = keyListener.bind( this, 'closeSearch' );
		this.openListener = keyListener.bind( this, 'openSearch' );
	}

	setOpenIconRef = ( openIcon ) => ( this.openIcon = openIcon );

	setSearchInputRef = ( input ) => ( this.searchInput = input );

	setOverlayRef = ( overlay ) => ( this.overlay = overlay );

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.onSearch !== this.props.onSearch ||
			nextProps.delaySearch !== this.props.delaySearch
		) {
			this.onSearch = this.props.delaySearch
				? debounce( this.props.onSearch, this.props.delayTimeout )
				: this.props.onSearch;
		}

		if ( this.props.isOpen !== nextProps.isOpen ) {
			this.setState( { isOpen: nextProps.isOpen } );
		}

		if (
			this.props.value !== nextProps.value &&
			( nextProps.value || nextProps.value === '' ) &&
			nextProps.value !== this.state.keyword
		) {
			this.setState( { keyword: nextProps.value } );
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		this.scrollOverlay();
		// Focus if the search box was opened or the autoFocus prop has changed
		if (
			( this.state.isOpen && ! prevState.isOpen ) ||
			( this.props.autoFocus && ! prevProps.autoFocus )
		) {
			this.focus();
		}

		if ( this.state.keyword === prevState.keyword ) {
			return;
		}
		// if there's a keyword change and mode is search-on-write: trigger search
		// The empty string must be handled always becuase it can be triggered:
		// - by the user clicking on the clear icon
		// - by the user pressing the ESC key
		// Additionally, the search can be triggered on demand by using the boolean prop `applySearch`
		if ( this.isSearchOnWriteMode() || this.state.keyword === '' || this.props.applySearch ) {
			this.updateSearch();
		}
		this.props.onSearchChange( this.state.keyword );
	}

	componentDidMount() {
		this.onSearch = this.props.delaySearch
			? debounce( this.props.onSearch, this.props.delayTimeout )
			: this.props.onSearch;
	}

	scrollOverlay = () => {
		this.overlay &&
			window.requestAnimationFrame( () => {
				if ( this.overlay && this.searchInput ) {
					this.overlay.scrollLeft = this.getScrollLeft( this.searchInput );
				}
			} );
	};

	//This is fix for IE11. Does not work on Edge.
	//On IE11 scrollLeft value for input is always 0.
	//We are calculating it manually using TextRange object.
	getScrollLeft = ( inputElement ) => {
		//TextRange is IE11 specific so this checks if we are not on IE11.
		if ( ! inputElement.createTextRange ) {
			return inputElement.scrollLeft;
		}

		const range = inputElement.createTextRange();
		const inputStyle = window.getComputedStyle( inputElement, undefined );
		const paddingLeft = parseFloat( inputStyle.paddingLeft );
		const rangeRect = range.getBoundingClientRect();
		const scrollLeft =
			inputElement.getBoundingClientRect().left +
			inputElement.clientLeft +
			paddingLeft -
			rangeRect.left;
		return scrollLeft;
	};

	focus = () => {
		// if we call focus before the element has been entirely synced up with the DOM, we stand a decent chance of
		// causing the browser to scroll somewhere odd. Instead, defer the focus until a future turn of the event loop.
		setTimeout( () => this.searchInput && this.searchInput.focus(), 0 );
	};

	blur = () => this.searchInput.blur();

	clear = () => this.setState( { keyword: '' } );

	onBlur = ( event ) => {
		if ( this.props.onBlur ) {
			this.props.onBlur( event );
		}

		this.setState( { hasFocus: false } );
	};

	onChange = ( event ) => {
		this.setState( {
			keyword: event.target.value,
		} );
	};

	openSearch = ( event ) => {
		event.preventDefault();
		this.setState( {
			keyword: '',
			isOpen: true,
		} );

		gaRecordEvent( this.props.analyticsGroup, 'Clicked Open Search' );
	};

	closeSearch = ( event ) => {
		event.preventDefault();

		if ( this.props.disabled ) {
			return;
		}

		this.setState( {
			keyword: '',
			isOpen: this.props.isOpen || false,
		} );

		this.searchInput.value = ''; // will not trigger onChange

		if ( this.props.pinned ) {
			this.searchInput.blur();
			this.openIcon.focus();
		} else {
			this.searchInput.focus();
		}

		this.props.onSearchClose( event );

		gaRecordEvent( this.props.analyticsGroup, 'Clicked Close Search' );
	};

	keyUp = ( event ) => {
		if ( event.key === 'Enter' && isMobile() ) {
			//dismiss soft keyboards
			this.blur();
		}

		if ( ! this.props.pinned ) {
			return;
		}

		if ( event.key === 'Escape' ) {
			this.closeSearch( event );
		}
		this.scrollOverlay();
	};

	keyDown = ( event ) => {
		this.scrollOverlay();
		if ( event.key === 'Escape' && event.target.value === '' ) {
			this.closeSearch( event );
		}
		if ( this.isSearchOnEnterMode() && event.key === 'Enter' ) {
			this.updateSearch();
		}
		this.props.onKeyDown( event );
	};

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	onFocus = () => {
		if ( ! this.searchInput ) {
			return;
		}

		const setValue = this.searchInput.value;
		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			this.searchInput.value = '';
			this.searchInput.value = setValue;
		}

		this.setState( { hasFocus: true } );
		this.props.onSearchOpen();
	};

	updateSearch = () => {
		if ( this.state.keyword ) {
			// this.onSearch is debounced when this.props.delaySearch === true
			// this avoids unnecessary fetches while user types
			this.onSearch( this.state.keyword );
		} else {
			// this.props.onSearch is _not_ debounced
			// no need to debounce if ! this.state.keyword
			if ( this.props.delaySearch ) {
				// Cancel any pending debounce
				this.onSearch.cancel();
			}
			this.props.onSearch( this.state.keyword );
		}
	};

	isSearchOnEnterMode = () => {
		return this.props.searchMode === SEARCH_MODE_ON_ENTER;
	};
	isSearchOnWriteMode = () => {
		return ! this.isSearchOnEnterMode();
	};

	render() {
		const searchValue = this.state.keyword;
		const placeholder = this.props.placeholder || i18n.translate( 'Search…', { textOnly: true } );
		const inputLabel = this.props.inputLabel;
		const enableOpenIcon = this.props.pinned && ! this.state.isOpen;
		const isOpenUnpinnedOrQueried =
			this.state.isOpen || ! this.props.pinned || this.props.initialValue;

		const autocorrect = this.props.disableAutocorrect && {
			autoComplete: 'off',
			autoCorrect: 'off',
			spellCheck: 'false',
		};

		const searchClass = clsx( this.props.additionalClasses, this.props.dir, {
			'is-expanded-to-container': this.props.fitsContainer,
			'is-open': isOpenUnpinnedOrQueried,
			'is-searching': this.props.searching,
			'is-compact': this.props.compact,
			'has-focus': ! this.props.hideFocus && this.state.hasFocus,
			'has-open-icon': ! this.props.hideOpenIcon,
			search: true,
		} );

		const fadeDivClass = clsx( 'search__input-fade', this.props.dir );
		const inputClass = clsx( 'search__input', this.props.dir );

		return (
			<div dir={ this.props.dir || null } className={ searchClass } role="search">
				<Spinner />
				<div
					role="button"
					className="search__icon-navigation"
					ref={ this.setOpenIconRef }
					onClick={ enableOpenIcon ? this.openSearch : this.focus }
					tabIndex={ enableOpenIcon ? '0' : null }
					onKeyDown={ enableOpenIcon ? this.openListener : null }
					aria-controls={ 'search-component-' + this.instanceId }
					aria-label={ i18n.translate( 'Open Search', { context: 'button label' } ) }
				>
					{ ! this.props.hideOpenIcon && <Icon icon={ search } className="search__open-icon" /> }
				</div>
				<div className={ fadeDivClass }>
					<FormTextInput
						type="search"
						id={ 'search-component-' + this.instanceId }
						autoFocus={ this.props.autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
						aria-describedby={ this.props.describedBy }
						aria-label={ inputLabel ? inputLabel : i18n.translate( 'Search' ) }
						aria-hidden={ ! isOpenUnpinnedOrQueried }
						className={ inputClass }
						placeholder={ placeholder }
						role="searchbox"
						value={ searchValue }
						inputRef={ this.setSearchInputRef }
						onChange={ this.onChange }
						onKeyUp={ this.keyUp }
						onKeyDown={ this.keyDown }
						onMouseUp={ this.props.onClick }
						onFocus={ this.onFocus }
						onBlur={ this.onBlur }
						disabled={ this.props.disabled }
						autoCapitalize="none"
						dir={ this.props.dir }
						maxLength={ this.props.maxLength }
						minLength={ this.props.minLength }
						{ ...autocorrect }
					/>
					{ this.props.overlayStyling && this.renderStylingDiv() }
				</div>
				{ this.closeButton() }
				{ this.props.children }
			</div>
		);
	}

	renderStylingDiv() {
		return (
			<div className="search__text-overlay" ref={ this.setOverlayRef }>
				{ this.props.overlayStyling( this.state.keyword ) }
			</div>
		);
	}

	closeButton() {
		if ( ! this.props.hideClose && ( this.state.keyword || this.state.isOpen ) ) {
			return (
				<div
					role="button"
					className="search__icon-navigation"
					onClick={ this.closeSearch }
					tabIndex="0"
					onKeyDown={ this.closeListener }
					aria-controls={ 'search-component-' + this.instanceId }
					aria-label={ i18n.translate( 'Close Search', { context: 'button label' } ) }
				>
					<Icon icon={ closeSmall } className="search__close-icon" />
				</div>
			);
		}

		return null;
	}
}

export default Search;
