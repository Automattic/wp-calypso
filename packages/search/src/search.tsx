/**
 * External dependencies
 */
import React, { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { debounce, noop, uniqueId } from 'lodash';
import classNames from 'classnames';
import { isMobile } from '@automattic/viewport';

/**
 * WordPress dependencies
 */
// @ts-ignore
import { Spinner, __experimentalInputControl as InputControl } from '@wordpress/components';
import { close, search, Icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;

const keyListener = (
	methodToCall: ( e: MouseEvent< HTMLDivElement > | KeyboardEvent< HTMLDivElement > ) => void
) => ( event: KeyboardEvent< HTMLDivElement > ) => {
	switch ( event.key ) {
		case ' ':
		case 'Enter':
			methodToCall( event );
			break;
	}
};

type Props = {
	autoFocus: boolean;
	className?: string;
	compact: boolean;
	delaySearch: boolean;
	delayTimeout: number;
	describedBy?: string;
	dir?: 'ltr' | 'rlt';
	disableAutocorrect: boolean;
	disabled: boolean;
	fitsContainer: boolean;
	hideClose: boolean;
	hideOpenIcon: boolean;
	initialValue?: string;
	inputLabel?: string;
	isOpen: boolean;
	maxLength?: number;
	minLength?: number;
	onBlur?: ( event: MouseEvent< HTMLInputElement > ) => void;
	onClick?: () => void;
	onKeyDown?: ( event: KeyboardEvent< HTMLInputElement > ) => void;
	onSearch: ( search: string ) => void;
	onSearchChange: ( search: string ) => void;
	onSearchOpen: ( event?: MouseEvent< HTMLDivElement > | KeyboardEvent< HTMLDivElement > ) => void;
	onSearchClose: ( event: MouseEvent< HTMLDivElement > | KeyboardEvent< HTMLDivElement > ) => void;
	overlayStyling?: ( search: string ) => React.ReactNode;
	placeholder?: string;
	pinned: boolean;
	searching: boolean;
	value?: string;
};

type State = {
	keyword: string;
	isOpen: boolean;
	hasFocus: boolean;
};

class Search extends React.Component< Props, State > {
	static defaultProps = {
		autoFocus: false,
		compact: false,
		delaySearch: false,
		delayTimeout: SEARCH_DEBOUNCE_MS,
		describedBy: null,
		dir: undefined,
		disableAutocorrect: false,
		disabled: false,
		fitsContainer: false,
		hideClose: false,
		hideOpenIcon: false,
		isOpen: false,
		onClick: noop,
		onKeyDown: noop,
		onSearchChange: noop,
		onSearchOpen: noop,
		onSearchClose: noop,
		//undefined value for overlayStyling is an optimization that will
		//disable overlay scrolling calculation when no overlay is provided.
		overlayStyling: undefined,
		pinned: false,
		searching: false,
	};

	instanceId = uniqueId();
	searchInput = React.createRef< HTMLInputElement >();
	openIcon = React.createRef< HTMLDivElement >();
	overlay = React.createRef< HTMLDivElement >();

	// debounced `onSearch` will have a `cancel` function
	onSearch: ( ( search: string ) => void ) & { cancel?: () => void } = this.props.delaySearch
		? debounce( this.props.onSearch, this.props.delayTimeout )
		: this.props.onSearch;

	state = {
		keyword: this.props.initialValue ?? '',
		isOpen: this.props.isOpen,
		hasFocus: this.props.autoFocus,
	};

	UNSAFE_componentWillReceiveProps( nextProps: Props ) {
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

	openSearch = ( event: MouseEvent< HTMLDivElement > | KeyboardEvent< HTMLDivElement > ) => {
		event.preventDefault();
		this.setState( {
			keyword: '',
			isOpen: true,
		} );
		this.props.onSearchOpen( event );
	};

	closeSearch = ( event: MouseEvent< HTMLDivElement > | KeyboardEvent< HTMLDivElement > ) => {
		event.preventDefault();

		if ( this.props.disabled ) {
			return;
		}

		this.setState( {
			keyword: '',
			isOpen: this.props.isOpen || false,
		} );

		if ( this.searchInput?.current ) {
			this.searchInput.current.value = ''; // will not trigger onChange
		}

		if ( this.props.pinned ) {
			this.searchInput?.current?.blur();
			this.openIcon?.current?.focus();
		} else {
			this.searchInput?.current?.focus();
		}

		this.props.onSearchClose( event );
	};

	closeListener = keyListener( this.closeSearch );
	openListener = keyListener( this.openSearch );

	componentDidUpdate( prevProps: Props, prevState: State ) {
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
				this.onSearch.cancel?.();
			}
			this.props.onSearch( this.state.keyword );
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
				if ( this.overlay?.current && this.searchInput?.current ) {
					this.overlay.current.scrollLeft = this.getScrollLeft( this.searchInput.current );
				}
			} );
	};

	//This is fix for IE11. Does not work on Edge.
	//On IE11 scrollLeft value for input is always 0.
	//We are calculating it manually using TextRange object.
	getScrollLeft = ( inputElement: HTMLInputElement & { createTextRange?: any } ) => {
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
		setTimeout( () => this.searchInput.current?.focus(), 0 );
	};

	blur = () => this.searchInput.current?.blur();

	clear = () => this.setState( { keyword: '' } );

	onBlur = ( event: MouseEvent< HTMLInputElement > ) => {
		if ( this.props.onBlur ) {
			this.props.onBlur( event );
		}

		this.setState( { hasFocus: false } );
	};

	onChange = ( keyword: string ) => {
		this.setState( {
			keyword,
		} );
	};

	keyUp = ( event: KeyboardEvent< HTMLInputElement > ) => {
		if ( event.key === 'Enter' && isMobile() ) {
			//dismiss soft keyboards
			this.blur();
		}

		if ( ! this.props.pinned ) {
			return;
		}

		if ( event.key === 'Escape' ) {
			this.closeListener( event );
		}
		this.scrollOverlay();
	};

	keyDown = ( event: KeyboardEvent< HTMLInputElement > ) => {
		this.scrollOverlay();

		// @todo(saramarcondes) investigate why `target` doesn't have the expected type
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		if ( event.key === 'Escape' && event.target?.value === '' ) {
			this.closeListener( event );
		}

		this.props.onKeyDown?.( event );
	};

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	onFocus = () => {
		if ( ! this.searchInput.current ) {
			return;
		}

		const setValue = this.searchInput.current.value ?? '';
		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			this.searchInput.current.value = '';
			this.searchInput.current.value = setValue;
		}

		this.setState( { hasFocus: true } );
		this.props.onSearchOpen();
	};

	render() {
		const searchValue = this.state.keyword;
		const placeholder = this.props.placeholder || __( 'Search…' );
		const inputLabel = this.props.inputLabel;
		const enableOpenIcon = this.props.pinned && ! this.state.isOpen;
		const isOpenUnpinnedOrQueried =
			this.state.isOpen || ! this.props.pinned || this.props.initialValue;

		const autocorrect = this.props.disableAutocorrect && {
			autoComplete: 'off',
			autoCorrect: 'off',
			spellCheck: 'false',
		};

		const searchClass = classNames( this.props.className, this.props.dir, {
			'is-expanded-to-container': this.props.fitsContainer,
			'is-open': isOpenUnpinnedOrQueried,
			'is-searching': this.props.searching,
			'is-compact': this.props.compact,
			'has-focus': this.state.hasFocus,
			'has-open-icon': ! this.props.hideOpenIcon,
			search: true,
		} );

		const fadeDivClass = classNames( 'search__input-fade', this.props.dir );
		const inputClass = classNames( 'search__input', this.props.dir );

		return (
			<div dir={ this.props.dir } className={ searchClass } role="search">
				<Spinner />
				<div
					role="button"
					className="search__icon-navigation"
					ref={ this.openIcon }
					onClick={ enableOpenIcon ? this.openSearch : this.focus }
					tabIndex={ enableOpenIcon ? 0 : undefined }
					onKeyDown={ enableOpenIcon ? this.openListener : undefined }
					aria-controls={ 'search-component-' + this.instanceId }
					aria-label={ __( 'Open Search' ) }
				>
					{ /* @ts-ignore */ }
					{ ! this.props.hideOpenIcon && <Icon icon={ search } className="search__open-icon" /> }
				</div>
				<div className={ fadeDivClass }>
					<InputControl
						type="search"
						id={ 'search-component-' + this.instanceId }
						autoFocus={ this.props.autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
						aria-describedby={ this.props.describedBy }
						aria-label={ inputLabel ? inputLabel : __( 'Search' ) }
						aria-hidden={ ! isOpenUnpinnedOrQueried }
						className={ inputClass }
						placeholder={ placeholder }
						role="searchbox"
						value={ searchValue }
						ref={ this.searchInput }
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
					{ this.renderStylingDiv() }
				</div>
				{ this.closeButton() }
			</div>
		);
	}

	renderStylingDiv() {
		if ( this.props.overlayStyling ) {
			return (
				<div className="search__text-overlay" ref={ this.overlay }>
					{ this.props.overlayStyling( this.state.keyword ) }
				</div>
			);
		}
		return null;
	}

	closeButton() {
		if ( ! this.props.hideClose && ( this.state.keyword || this.state.isOpen ) ) {
			return (
				<div
					role="button"
					className="search__icon-navigation"
					onClick={ this.closeSearch }
					tabIndex={ 0 }
					onKeyDown={ this.closeListener }
					aria-controls={ 'search-component-' + this.instanceId }
					aria-label={ __( 'Close Search' ) }
				>
					{ /* @ts-ignore */ }
					<Icon icon={ close } className="search__close-icon" />
				</div>
			);
		}

		return null;
	}
}

export default Search;
