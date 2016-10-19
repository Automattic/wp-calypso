/** @ssr-ready **/

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Spinner from 'components/spinner';
import Gridicon from 'components/gridicon';
import { isMobile } from 'lib/viewport';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;

function keyListener( methodToCall, event ) {
	switch ( event.key ) {
		case ' ':
		case 'Enter':
			this[ methodToCall ]( event );
			break;
	}
}

const Search = React.createClass( {

	displayName: 'Search',

	statics: {
		instances: 0
	},

	propTypes: {
		additionalClasses: PropTypes.string,
		initialValue: PropTypes.string,
		placeholder: PropTypes.string,
		pinned: PropTypes.bool,
		delaySearch: PropTypes.bool,
		delayTimeout: PropTypes.number,
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
		hideClose: PropTypes.bool
	},

	getInitialState: function() {
		return {
			keyword: this.props.initialValue || '',
			isOpen: !! this.props.isOpen,
			hasFocus: false
		};
	},

	getDefaultProps: function() {
		return {
			pinned: false,
			delaySearch: false,
			delayTimeout: SEARCH_DEBOUNCE_MS,
			autoFocus: false,
			disabled: false,
			onSearchChange: noop,
			onSearchOpen: noop,
			onSearchClose: noop,
			onKeyDown: noop,
			onClick: noop,
			overlayStyling: noop,
			disableAutocorrect: false,
			searching: false,
			isOpen: false,
			dir: undefined,
			fitsContainer: false,
			hideClose: false
		};
	},

	componentWillMount: function() {
		this.setState( {
			instanceId: ++Search.instances
		} );

		this.closeListener = keyListener.bind( this, 'closeSearch' );
		this.openListener = keyListener.bind( this, 'openSearch' );
	},

	componentWillReceiveProps: function( nextProps ) {
		if (
			nextProps.onSearch !== this.props.onSearch ||
			nextProps.delaySearch !== this.props.delaySearch
		) {
			this.onSearch = this.props.delaySearch
				? debounce( this.props.onSearch, this.props.delayTimeout )
				: this.props.onSearch;
		}

		if ( nextProps.isOpen ) {
			this.setState( { isOpen: nextProps.isOpen } );
		}

		if ( nextProps.initialValue !== this.props.initialValue &&
				( this.state.keyword === this.props.initialValue || this.state.keyword === '' ) ) {
			this.setState( { keyword: nextProps.initialValue || '' } );
		}
	},

	componentDidUpdate: function( prevProps, prevState ) {
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
		// if there's a keyword change: trigger search
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
		this.props.onSearchChange( this.refs.searchInput.value );
	},

	componentDidMount: function() {
		this.onSearch = this.props.delaySearch
			? debounce( this.props.onSearch, this.props.delayTimeout )
			: this.props.onSearch;

		if ( this.props.autoFocus ) {
			// this hack makes autoFocus work correctly in Dropdown
			setTimeout( () => this.focus(), 0 );
		}
	},

	scrollOverlay: function() {
	 this.refs.overlay && window.requestAnimationFrame( () => {
		 if ( this.refs.overlay && this.refs.searchInput ) {
			 this.refs.overlay.scrollLeft = this.getScrollLeft( this.refs.searchInput );
		 }
	 } );
 },

 //This is fic for IE11 does not work on Edge.
	getScrollLeft: function ( inputElement ) {
		let range;
		if ( inputElement.createTextRange ) {
			range = inputElement.createTextRange();
	 	} else {
		 return inputElement.scrollLeft;
		}
	 	const inputStyle = window.getComputedStyle(inputElement, undefined);
	 	const paddingLeft = parseFloat(inputStyle.paddingLeft);
	 	const rangeRect = range.getBoundingClientRect();
	 	const scrollLeft = inputElement.getBoundingClientRect().left + inputElement.clientLeft + paddingLeft - rangeRect.left;
	 	return scrollLeft;
 },


	focus: function() {
		// if we call focus before the element has been entirely synced up with the DOM, we stand a decent chance of
		// causing the browser to scroll somewhere odd. Instead, defer the focus until a future turn of the event loop.
		setTimeout( () => this.refs.searchInput && ReactDom.findDOMNode( this.refs.searchInput ).focus(), 0 );
	},

	blur: function() {
		ReactDom.findDOMNode( this.refs.searchInput ).blur();
	},

	getCurrentSearchValue: function() {
		return ReactDom.findDOMNode( this.refs.searchInput ).value;
	},

	clear: function() {
		this.setState( { keyword: '' } );
	},

	onBlur: function( event ) {
		if ( this.props.onBlur ) {
			this.props.onBlur( event );
		}

		this.setState( { hasFocus: false } );
	},

	onChange: function() {
		this.setState( {
			keyword: this.getCurrentSearchValue()
		} );
	},

	openSearch: function( event ) {
		event.preventDefault();
		this.setState( {
			keyword: '',
			isOpen: true
		} );

		analytics.ga.recordEvent( this.props.analyticsGroup, 'Clicked Open Search' );
	},

	closeSearch: function( event ) {
		event.preventDefault();

		if ( this.props.disabled ) {
			return;
		}

		const input = ReactDom.findDOMNode( this.refs.searchInput );

		this.setState( {
			keyword: '',
			isOpen: this.props.isOpen || false
		} );

		input.value = ''; // will not trigger onChange
		input.blur();

		if ( this.props.pinned ) {
			ReactDom.findDOMNode( this.refs.openIcon ).focus();
		}

		this.props.onSearchClose( event );

		analytics.ga.recordEvent( this.props.analyticsGroup, 'Clicked Close Search' );
	},

	keyUp: function( event ) {
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
	},

	keyDown: function( event ) {
		this.scrollOverlay();
		if ( event.key === 'Escape' && event.target.value === '' ) {
			this.closeSearch( event );
		}
		this.props.onKeyDown( event );
	},

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	onFocus: function() {
		const input = ReactDom.findDOMNode( this.refs.searchInput ),
			setValue = input.value;

		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			input.value = '';
			input.value = setValue;
		}

		this.setState( { hasFocus: true } );
		this.props.onSearchOpen( );
	},

	render: function() {
		const searchValue = this.state.keyword;
		const placeholder = this.props.placeholder ||
				i18n.translate( 'Search…', { textOnly: true } );

		const enableOpenIcon = this.props.pinned && ! this.state.isOpen;
		const isOpenUnpinnedOrQueried = this.state.isOpen ||
				! this.props.pinned ||
				this.props.initialValue;

		const autocorrect = this.props.disableAutocorrect && {
			autoComplete: 'off',
			autoCorrect: 'off',
			spellCheck: 'false'
		};

		const searchClass = classNames( this.props.additionalClasses, this.props.dir, {
			'is-expanded-to-container': this.props.fitsContainer,
			'is-open': isOpenUnpinnedOrQueried,
			'is-searching': this.props.searching,
			'has-focus': this.state.hasFocus,
			search: true
		} );

		const fadeDivClass = classNames( 'search__input-fade', this.props.dir );
		const inputClass = classNames( 'search__input', this.props.dir );

		return (
			<div dir={ this.props.dir || null } className={ searchClass } role="search">
				<Spinner />
				<div
					className="search__icon-navigation"
					ref="openIcon"
					onTouchTap={ enableOpenIcon ? this.openSearch : this.focus }
					tabIndex={ enableOpenIcon ? '0' : null }
					onKeyDown={ enableOpenIcon
						? this.openListener
						: null
					}
					aria-controls={ 'search-component-' + this.state.instanceId }
					aria-label={ i18n.translate( 'Open Search', { context: 'button label' } ) }>
					<Gridicon icon="search" className="search__open-icon" />
				</div>
				<div className={ fadeDivClass }>
					<input
						type="text"
						id={ 'search-component-' + this.state.instanceId }
						className={ inputClass }
						placeholder={ placeholder }
						role="search"
						value={ searchValue }
						ref="searchInput"
						onInput={ this.onChange }
						onKeyUp={ this.keyUp }
						onKeyDown={ this.keyDown }
						onMouseUp={ this.props.onClick }
						onFocus={ this.onFocus }
						onBlur={ this.onBlur }
						disabled={ this.props.disabled }
						aria-hidden={ ! isOpenUnpinnedOrQueried }
						autoCapitalize="none"
						dir={ this.props.dir }
						maxLength={ this.props.maxLength }
						{ ...autocorrect }
					/>
					{ this.props.overlayStyling && this.renderStylingDiv() }
				</div>
				{ this.closeButton() }
			</div>
		);
	},

	renderStylingDiv: function() {
		return (
			<div className="search__text-overlay" ref="overlay">
				{ this.props.overlayStyling( this.state.keyword ) }
			</div>
		);
	},

	closeButton: function() {
		if ( ! this.props.hideClose && ( this.state.keyword || this.state.isOpen ) ) {
			return (
				<div
					className="search__icon-navigation"
					onTouchTap={ this.closeSearch }
					tabIndex="0"
					onKeyDown={ this.closeListener }
					aria-controls={ 'search-component-' + this.state.instanceId }
					aria-label={ i18n.translate( 'Close Search', { context: 'button label' } ) }>
					<Gridicon icon="cross" className="search__close-icon" />
				</div>
			);
		}

		return null;
	}
} );

module.exports = Search;
