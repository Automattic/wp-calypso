/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { ChangeEvent, FocusEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react';
import { debounce, noop, uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, search, Icon } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;

const keyListener = (
	methodToCall: (
		e:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	) => void
) => ( event: KeyboardEvent< HTMLButtonElement | HTMLInputElement > ) => {
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
	defaultIsOpen: boolean;
	defaultValue?: string;
	delaySearch: boolean;
	delayTimeout: number;
	describedBy?: string;
	dir?: 'ltr' | 'rtl';
	disableAutocorrect: boolean;
	disabled: boolean;
	fitsContainer: boolean;
	hideClose: boolean;
	hideOpenIcon: boolean;
	inputLabel?: string;
	openIconSide?: 'left' | 'right';
	maxLength?: number;
	minLength?: number;
	onBlur?: ( event: FocusEvent< HTMLInputElement > ) => void;
	onClick?: () => void;
	onKeyDown?: ( event: KeyboardEvent< HTMLInputElement > ) => void;
	onSearch: ( search: string ) => void;
	onSearchChange: ( search: string ) => void;
	onSearchOpen: (
		event?:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	) => void;
	onSearchClose: (
		event:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	) => void;
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
		defaultIsOpen: false,
		onClick: noop,
		onKeyDown: noop,
		onSearchChange: noop,
		onSearchOpen: noop,
		onSearchClose: noop,
		openIconSide: 'left',
		//undefined value for overlayStyling is an optimization that will
		//disable overlay scrolling calculation when no overlay is provided.
		overlayStyling: undefined,
		pinned: false,
		searching: false,
	};

	instanceId = uniqueId();
	searchInput = React.createRef< HTMLInputElement >();
	openIcon = React.createRef< HTMLButtonElement >();
	overlay = React.createRef< HTMLDivElement >();

	// debounced `onSearch` will have a `cancel` function
	onSearch: ( ( search: string ) => void ) & { cancel?: () => void } = this.props.delaySearch
		? debounce( this.props.onSearch, this.props.delayTimeout )
		: this.props.onSearch;

	state = {
		keyword: this.props.defaultValue ?? '',
		isOpen: this.props.defaultIsOpen,
		hasFocus: this.props.autoFocus,
	};

	openSearch = (
		event:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	): void => {
		event.preventDefault();
		this.setState( {
			keyword: '',
			isOpen: true,
		} );
		this.props.onSearchOpen( event );
		// prevent outlines around the open icon after being clicked
		this.openIcon.current?.blur();
	};

	closeSearch = (
		event:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	): void => {
		event.preventDefault();

		if ( this.props.disabled ) {
			return;
		}

		this.setState( {
			keyword: '',
			isOpen: false,
		} );

		if ( this.searchInput.current ) {
			this.searchInput.current.value = ''; // will not trigger onChange
		}

		if ( this.props.pinned ) {
			this.searchInput.current?.blur();
			this.openIcon.current?.focus();
		} else {
			this.searchInput.current?.focus();
		}

		this.props.onSearchClose( event );
	};

	closeListener = keyListener( this.closeSearch );
	openListener = keyListener( this.openSearch );

	componentDidUpdate( _: Props, prevState: State ): void {
		this.scrollOverlay();
		// Focus if the search box was opened
		if ( this.state.isOpen && ! prevState.isOpen ) {
			this.focus();
		}

		if ( this.state.keyword === prevState.keyword ) {
			return;
		}

		// if there's a keyword change: trigger search
		if ( this.state.keyword ) {
			this.onSearch( this.state.keyword );
		} else {
			// explicitly bypass debouncing when there is no keyword is empty
			if ( this.props.delaySearch ) {
				// Cancel any pending debounce
				this.onSearch.cancel?.();
			}

			this.props.onSearch( this.state.keyword );
		}

		this.props.onSearchChange( this.state.keyword );
	}

	scrollOverlay = (): void => {
		this.overlay &&
			window.requestAnimationFrame( () => {
				if ( this.overlay.current && this.searchInput.current ) {
					this.overlay.current.scrollLeft = this.getScrollLeft( this.searchInput.current );
				}
			} );
	};

	//This is fix for IE11. Does not work on Edge.
	//On IE11 scrollLeft value for input is always 0.
	//We are calculating it manually using TextRange object.
	getScrollLeft = (
		inputElement: HTMLInputElement & { createTextRange?: () => Range }
	): number => {
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

	focus = (): void => {
		// if we call focus before the element has been entirely synced up with the DOM, we stand a decent chance of
		// causing the browser to scroll somewhere odd. Instead, defer the focus until a future turn of the event loop.
		setTimeout( () => this.searchInput.current?.focus(), 0 );
	};

	blur = (): void => this.searchInput.current?.blur();

	clear = (): void => this.setState( { keyword: '' } );

	onBlur = ( event: FocusEvent< HTMLInputElement > ): void => {
		if ( this.props.onBlur ) {
			this.props.onBlur( event );
		}

		this.setState( { hasFocus: false } );
	};

	onChange = ( event: ChangeEvent< HTMLInputElement > ): void => {
		this.setState( {
			keyword: event.target?.value ?? this.state.keyword,
		} );
	};

	keyUp = ( event: KeyboardEvent< HTMLInputElement > ): void => {
		if ( event.key === 'Enter' && window.innerWidth < 480 ) {
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

	keyDown = ( event: KeyboardEvent< HTMLInputElement > ): void => {
		this.scrollOverlay();

		if (
			event.key === 'Escape' &&
			// currentTarget will be the input element, rather than target which can be anything
			event.currentTarget?.value === ''
		) {
			this.closeListener( event );
		}

		this.props.onKeyDown?.( event );
	};

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	onFocus = (): void => {
		this.setState( { hasFocus: true } );
		this.props.onSearchOpen();

		if ( ! this.searchInput.current ) {
			return;
		}

		const setValue = this.searchInput.current.value ?? '';
		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			this.searchInput.current.value = '';
			this.searchInput.current.value = setValue;
		}
	};

	handleSubmit = ( event: FormEvent ): void => {
		event.preventDefault();
		event.stopPropagation();
	};

	render(): JSX.Element {
		const searchValue = this.state.keyword;
		const placeholder = this.props.placeholder || __( 'Search…' );
		const inputLabel = this.props.inputLabel;
		const isOpenUnpinnedOrQueried = this.state.isOpen || ! this.props.pinned || searchValue;

		const autocorrectProps = this.props.disableAutocorrect && {
			autoComplete: 'off',
			autoCorrect: 'off',
			spellCheck: 'false' as const,
		};

		const searchClass = classNames( 'search-component', this.props.className, this.props.dir, {
			'is-expanded-to-container': this.props.fitsContainer,
			'is-open': isOpenUnpinnedOrQueried,
			'is-searching': this.props.searching,
			'is-compact': this.props.compact,
			'has-focus': this.state.hasFocus,
			'has-open-icon': ! this.props.hideOpenIcon,
		} );

		const fadeClass = classNames( 'search-component__input-fade', this.props.dir );
		const inputClass = classNames( 'search-component__input', this.props.dir );

		const shouldRenderRightOpenIcon = this.props.openIconSide === 'right' && ! this.state.keyword;

		return (
			<div dir={ this.props.dir } className={ searchClass } role="search">
				<Spinner />
				{ this.props.openIconSide === 'left' && this.renderOpenIcon() }
				<form className={ fadeClass } action="." onSubmit={ this.handleSubmit }>
					<input
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
						{ ...autocorrectProps }
					/>
					{ this.renderStylingDiv() }
				</form>
				{ shouldRenderRightOpenIcon ? this.renderOpenIcon() : this.closeButton() }
			</div>
		);
	}

	renderOpenIcon(): JSX.Element {
		const enableOpenIcon = this.props.pinned && ! this.state.isOpen;

		return (
			<Button
				className="search-component__icon-navigation"
				ref={ this.openIcon }
				onClick={ enableOpenIcon ? this.openSearch : this.focus }
				tabIndex={ enableOpenIcon ? 0 : undefined }
				onKeyDown={ enableOpenIcon ? this.openListener : undefined }
				aria-controls={ 'search-component-' + this.instanceId }
				aria-label={ __( 'Open Search' ) }
			>
				{ ! this.props.hideOpenIcon && (
					/* @ts-ignore */
					<Icon icon={ search } className="search-component__open-icon" />
				) }
			</Button>
		);
	}

	renderStylingDiv(): JSX.Element | null {
		if ( typeof this.props.overlayStyling === 'function' ) {
			return (
				<div className="search-component__text-overlay" ref={ this.overlay }>
					{ this.props.overlayStyling( this.state.keyword ) }
				</div>
			);
		}
		return null;
	}

	closeButton(): JSX.Element | null {
		if ( ! this.props.hideClose && ( this.state.keyword || this.state.isOpen ) ) {
			return (
				<Button
					className="search-component__icon-navigation"
					onClick={ this.closeSearch }
					tabIndex={ 0 }
					onKeyDown={ this.closeListener }
					aria-controls={ 'search-component-' + this.instanceId }
					aria-label={ __( 'Close Search' ) }
				>
					{ /* @ts-ignore */ }
					<Icon icon={ close } className="search-component__close-icon" />
				</Button>
			);
		}

		return null;
	}
}

export default Search;
