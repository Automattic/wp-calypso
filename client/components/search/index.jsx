/** @ssr-ready **/

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
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
var SEARCH_DEBOUNCE_MS = 300;

const Search = React.createClass( {

	displayName: 'Search',

	statics: {
		instances: 0
	},

	propTypes: {
		additionalClasses: React.PropTypes.string,
		initialValue: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		pinned: React.PropTypes.bool,
		delaySearch: React.PropTypes.bool,
		delayTimeout: React.PropTypes.number,
		onSearch: React.PropTypes.func.isRequired,
		onSearchChange: React.PropTypes.func,
		onSearchClose: React.PropTypes.func,
		analyticsGroup: React.PropTypes.string,
		autoFocus: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		onKeyDown: React.PropTypes.func,
		disableAutocorrect: React.PropTypes.bool,
		onBlur: React.PropTypes.func,
		searching: React.PropTypes.bool,
		isOpen: React.PropTypes.bool,
		dir: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			keyword: this.props.initialValue || '',
			isOpen: !! this.props.isOpen
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
			onSearchClose: noop,
			onKeyDown: noop,
			disableAutocorrect: false,
			searching: false,
			isOpen: false,
			dir: undefined
		};
	},

	componentWillMount: function() {
		this.setState( {
			instanceId: ++Search.instances
		} );
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
	},

	componentDidUpdate: function( prevProps, prevState ) {
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
		this.props.onSearchChange( this.state.keyword );
	},

	componentDidMount: function() {
		this.onSearch = this.props.delaySearch
			? debounce( this.props.onSearch, this.props.delayTimeout )
			: this.props.onSearch;

		if ( this.props.autoFocus ) {
			this.focus();
		}
	},

	focus: function() {
		ReactDom.findDOMNode( this.refs.searchInput ).focus();
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

	onBlur: function() {
		if ( this.props.onBlur ) {
			this.props.onBlur();
		}
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
		var input;

		event.preventDefault();

		if ( this.props.disabled ) {
			return;
		}

		input = ReactDom.findDOMNode( this.refs.searchInput );

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
		if ( event.which === 13 && isMobile() ) {
			//dismiss soft keyboards
			this.blur();
		}

		if ( ! this.props.pinned ) {
			return;
		}

		if ( event.key === 'Escape' ) {
			this.closeSearch( event );
		}
	},

	keyDown: function( event ) {
		if ( event.key === 'Escape' && event.target.value === '' ) {
			this.closeSearch( event );
		}
		this.props.onKeyDown( event );
	},

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	onFocus: function() {
		var input = ReactDom.findDOMNode( this.refs.searchInput ),
			setValue = input.value;

		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			input.value = '';
			input.value = setValue;
		}
	},

	render: function() {
		var searchClass,
			searchValue = this.state.keyword,
			placeholder = this.props.placeholder ||
				i18n.translate( 'Search…', { textOnly: true } ),

			enableOpenIcon = this.props.pinned && ! this.state.isOpen,
			isOpenUnpinnedOrQueried = this.state.isOpen ||
				! this.props.pinned ||
				this.props.initialValue;

		const autocorrect = this.props.disableAutocorrect && {
			autoComplete: 'off',
			autoCorrect: 'off',
			spellCheck: 'false'
		};

		searchClass = classNames( this.props.additionalClasses, {
			'is-pinned': this.props.pinned,
			'is-open': isOpenUnpinnedOrQueried,
			'is-searching': this.props.searching,
			rtl: this.props.dir === 'rtl',
			ltr: this.props.dir === 'ltr',
			search: true
		} );

		return (
			<div className={ searchClass } role="search">
				<Spinner />
				<div
					ref="openIcon"
					onTouchTap={ enableOpenIcon ? this.openSearch : this.focus }
					tabIndex={ enableOpenIcon ? '0' : null }
					onKeyDown={ enableOpenIcon
						? this._keyListener.bind( this, 'openSearch' )
						: null
					}
					aria-controls={ 'search-component-' + this.state.instanceId }
					aria-label={ i18n.translate( 'Open Search', { context: 'button label' } ) }>
				<Gridicon icon="search" className={ 'search-open__icon' + ( this.props.dir ? ' ' + this.props.dir : '' ) }/>
				</div>
				<input
					type="search"
					id={ 'search-component-' + this.state.instanceId }
					className={ 'search__input' + ( this.props.dir ? ' ' + this.props.dir : '' ) }
					placeholder={ placeholder }
					role="search"
					value={ searchValue }
					ref="searchInput"
					onChange={ this.onChange }
					onKeyUp={ this.keyUp }
					onKeyDown={ this.keyDown }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
					disabled={ this.props.disabled }
					aria-hidden={ ! isOpenUnpinnedOrQueried }
					autoCapitalize="none"
					dir={ this.props.dir }
					{...autocorrect } />
				{ ( searchValue || this.state.isOpen ) ? this.closeButton() : null }
			</div>
		);
	},

	closeButton: function() {
		return (
			<span
				onTouchTap={ this.closeSearch }
				tabIndex="0"
				onKeyDown={ this._keyListener.bind( this, 'closeSearch' ) }
				aria-controls={ 'search-component-' + this.state.instanceId }
				aria-label={ i18n.translate( 'Close Search', { context: 'button label' } ) }>
			<Gridicon icon="cross" className={ 'search-close__icon' + ( this.props.dir ? ' ' + this.props.dir : '' ) } />
			</span>
		);
	},

	_keyListener: function( methodToCall, event ) {
		switch ( event.key ) {
			case ' ':
			case 'Enter':
				this[ methodToCall ]( event );
				break;
		}
	}
} );

module.exports = Search;
