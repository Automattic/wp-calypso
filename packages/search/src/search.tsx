/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import type {
	ReactNode,
	Ref,
	ChangeEvent,
	FocusEvent,
	FormEvent,
	KeyboardEvent,
	MouseEvent,
} from 'react';
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { close, search, Icon } from '@wordpress/icons';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { useUpdateEffect } from './utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;

type KeyboardOrMouseEvent =
	| MouseEvent< HTMLButtonElement | HTMLInputElement >
	| KeyboardEvent< HTMLButtonElement | HTMLInputElement >;

const keyListener = ( methodToCall: ( e: KeyboardOrMouseEvent ) => void ) => (
	event: KeyboardEvent< HTMLButtonElement | HTMLInputElement >
) => {
	switch ( event.key ) {
		case ' ':
		case 'Enter':
			methodToCall( event );
			break;
	}
};

type Props = {
	autoFocus?: boolean;
	className?: string;
	compact?: boolean;
	children?: ReactNode;
	defaultIsOpen?: boolean;
	defaultValue?: string;
	delaySearch?: boolean;
	delayTimeout?: number;
	describedBy?: string;
	dir?: 'ltr' | 'rtl';
	disableAutocorrect?: boolean;
	disabled?: boolean;
	fitsContainer?: boolean;
	hideClose?: boolean;
	isReskinned?: boolean;
	hideOpenIcon?: boolean;
	inputLabel?: string;
	openIconSide?: 'left' | 'right';
	maxLength?: number;
	minLength?: number;
	onBlur?: ( event: FocusEvent< HTMLInputElement > ) => void;
	onClick?: () => void;
	onKeyDown?: ( event: KeyboardEvent< HTMLInputElement > ) => void;
	onSearch: ( search: string ) => void;
	onSearchChange?: ( search: string ) => void;
	onSearchOpen?: () => void;
	onSearchClose?: ( event: KeyboardOrMouseEvent ) => void;
	overlayStyling?: ( search: string ) => React.ReactNode;
	placeholder?: string;
	pinned?: boolean;
	recordEvent?: ( eventName: string ) => void;
	searching?: boolean;
	value?: string;
};

//This is fix for IE11. Does not work on Edge.
//On IE11 scrollLeft value for input is always 0.
//We are calculating it manually using TextRange object.
const getScrollLeft = (
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

type ImperativeHandle = {
	focus: () => void;
	blur: () => void;
	clear: () => void;
};

const InnerSearch = (
	{
		children,
		delaySearch = false,
		disabled = false,
		pinned = false,
		onSearchClose,
		onSearchChange,
		onSearch,
		onBlur: onBlurProp,
		onKeyDown: onKeyDownProp,
		onClick,
		describedBy,
		delayTimeout = SEARCH_DEBOUNCE_MS,
		defaultValue = '',
		defaultIsOpen = false,
		autoFocus = false,
		onSearchOpen,
		recordEvent,
		overlayStyling,
		placeholder: placeholderProp,
		inputLabel,
		disableAutocorrect = false,
		className,
		dir,
		fitsContainer = false,
		searching = false,
		compact = false,
		hideOpenIcon = false,
		openIconSide = 'left',
		minLength,
		maxLength,
		hideClose = false,
		isReskinned = false,
	}: Props,
	forwardedRef: Ref< ImperativeHandle >
) => {
	const { __ } = useI18n();
	const [ keyword, setKeyword ] = React.useState( defaultValue );
	const [ isOpen, setIsOpen ] = React.useState( defaultIsOpen );
	const [ hasFocus, setHasFocus ] = React.useState( autoFocus );

	const instanceId = useInstanceId( InnerSearch, 'search' );
	const searchInput = React.useRef< HTMLInputElement >( null );
	const openIcon = React.useRef< HTMLButtonElement >( null );
	const overlay = React.useRef< HTMLDivElement >( null );

	React.useImperativeHandle(
		forwardedRef,
		() => ( {
			focus() {
				searchInput.current?.focus();
			},
			blur() {
				searchInput.current?.blur();
			},
			clear() {
				setKeyword( '' );
			},
		} ),
		[]
	);

	const doSearch: ( ( search: string ) => void ) & { cancel?: () => void } = React.useMemo( () => {
		if ( ! onSearch ) {
			return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
		}

		if ( ! delaySearch ) {
			return onSearch;
		}

		return debounce( onSearch, delayTimeout );
	}, [ onSearch, delayTimeout, delaySearch ] );

	useEffect( () => {
		if ( keyword ) {
			onSearch?.( keyword );
		}
		// Disable reason: This effect covers the case where a keyword was passed in as the default value and we only want to run it on first search; the useUpdateEffect below will handle the rest of the time that keyword updates
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useUpdateEffect( () => {
		if ( keyword ) {
			doSearch( keyword );
		} else {
			// explicitly bypass debouncing when keyword is empty
			if ( delaySearch ) {
				// Cancel any pending debounce
				doSearch.cancel?.();
			}

			// call the callback directly without debouncing
			onSearch?.( keyword );
		}

		onSearchChange?.( keyword );
	}, [ keyword ] );

	const openSearch = ( event: KeyboardOrMouseEvent ) => {
		event.preventDefault();

		setKeyword( '' );
		setIsOpen( true );

		searchInput.current?.focus();
		// no need to call `onSearchOpen` as it will be called by `onFocus` once the searcbox is focused
		// prevent outlines around the open icon after being clicked
		openIcon.current?.blur();
		recordEvent?.( 'Clicked Open Search' );
	};

	const closeSearch = ( event: KeyboardOrMouseEvent ) => {
		event.preventDefault();

		if ( disabled ) {
			return;
		}

		setKeyword( '' );
		setIsOpen( false );

		if ( searchInput.current ) {
			searchInput.current.value = ''; // will not trigger onChange
		}

		if ( pinned ) {
			searchInput.current?.blur();
			openIcon.current?.focus();
		} else {
			searchInput.current?.focus();
		}

		onSearchClose?.( event );

		recordEvent?.( 'Clicked Close Search' );
	};

	const closeListener = keyListener( closeSearch );
	const openListener = keyListener( openSearch );

	const scrollOverlay = () => {
		window.requestAnimationFrame( () => {
			if ( overlay.current && searchInput.current ) {
				overlay.current.scrollLeft = getScrollLeft( searchInput.current );
			}
		} );
	};

	React.useEffect( () => {
		scrollOverlay();
	}, [ keyword, isOpen, hasFocus ] );

	const onBlur = ( event: FocusEvent< HTMLInputElement > ) => {
		onBlurProp?.( event );
		setHasFocus( false );
	};

	const onChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setKeyword( event.target.value );
	};

	const onKeyUp = ( event: KeyboardEvent< HTMLInputElement > ) => {
		if ( event.key === 'Enter' && window.innerWidth < 480 ) {
			//dismiss soft keyboards
			blur();
		}

		if ( ! pinned ) {
			return;
		}

		if ( event.key === 'Escape' ) {
			closeListener( event );
		}
		scrollOverlay();
	};

	const onKeyDown = ( event: KeyboardEvent< HTMLInputElement > ) => {
		scrollOverlay();

		if (
			event.key === 'Escape' &&
			// currentTarget will be the input element, rather than target which can be anything
			event.currentTarget.value === ''
		) {
			closeListener( event );
		}

		onKeyDownProp?.( event );
	};

	// Puts the cursor at end of the text when starting
	// with `defaultValue` set.
	const onFocus = () => {
		setHasFocus( true );
		onSearchOpen?.();

		if ( ! searchInput.current ) {
			return;
		}

		const setValue = searchInput.current.value;
		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			searchInput.current.value = '';
			searchInput.current.value = setValue;
		}
	};

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const searchValue = keyword;
	const placeholder = placeholderProp || __( 'Search…', __i18n_text_domain__ );
	const isOpenUnpinnedOrQueried = isOpen || ! pinned || searchValue;

	const autocorrectProps = disableAutocorrect && {
		autoComplete: 'off',
		autoCorrect: 'off',
		spellCheck: 'false' as const,
	};

	const searchClass = classNames( 'search-component', className, dir, {
		'is-expanded-to-container': fitsContainer,
		'is-open': isOpenUnpinnedOrQueried,
		'is-searching': searching,
		'is-compact': compact,
		'has-focus': hasFocus,
		'has-open-icon': ! hideOpenIcon,
	} );

	const fadeClass = classNames( 'search-component__input-fade', dir );
	const inputClass = classNames( 'search-component__input', dir );

	const shouldRenderRightOpenIcon = openIconSide === 'right' && ! keyword;

	const renderStylingDiv = () => {
		if ( typeof overlayStyling === 'function' ) {
			return (
				<div className="search-component__text-overlay" ref={ overlay }>
					{ overlayStyling( keyword ) }
				</div>
			);
		}
		return null;
	};

	const renderReskinSearchIcon = () => {
		const searchIcon = (
			<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M13.8269 19.8984L8.49362 24.5651L7.50586 23.4362L12.8392 18.7695L13.8269 19.8984Z"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M17.9994 21.1667C21.221 21.1667 23.8327 18.555 23.8327 15.3333C23.8327 12.1117 21.221 9.5 17.9994 9.5C14.7777 9.5 12.166 12.1117 12.166 15.3333C12.166 18.555 14.7777 21.1667 17.9994 21.1667ZM17.9994 22.6667C22.0494 22.6667 25.3327 19.3834 25.3327 15.3333C25.3327 11.2832 22.0494 8 17.9994 8C13.9493 8 10.666 11.2832 10.666 15.3333C10.666 19.3834 13.9493 22.6667 17.9994 22.6667Z"
				/>
			</svg>
		);

		return <Icon icon={ searchIcon } size={ 32 } className="search-component__icon-search" />;
	};

	const renderOpenIcon = () => {
		const enableOpenIcon = pinned && ! isOpen;

		if ( isReskinned ) {
			return renderReskinSearchIcon();
		}

		return (
			<Button
				className="search-component__icon-navigation"
				ref={ openIcon }
				onClick={ enableOpenIcon ? openSearch : focus }
				tabIndex={ enableOpenIcon ? 0 : undefined }
				onKeyDown={ enableOpenIcon ? openListener : undefined }
				aria-controls={ 'search-component-' + instanceId }
				aria-label={ __( 'Open Search', __i18n_text_domain__ ) }
			>
				{ ! hideOpenIcon && <Icon icon={ search } className="search-component__open-icon" /> }
			</Button>
		);
	};

	const renderCloseButton = () => {
		if ( ! hideClose && ( keyword || isOpen ) ) {
			return (
				<Button
					className="search-component__icon-navigation"
					onClick={ closeSearch }
					tabIndex={ 0 }
					onKeyDown={ closeListener }
					aria-controls={ 'search-component-' + instanceId }
					aria-label={ __( 'Close Search', __i18n_text_domain__ ) }
				>
					<Icon icon={ close } className="search-component__close-icon" />
				</Button>
			);
		}

		return null;
	};

	return (
		<div dir={ dir } className={ searchClass } role="search">
			<Spinner />
			{ openIconSide === 'left' && renderOpenIcon() }
			<form className={ fadeClass } action="." onSubmit={ handleSubmit }>
				<input
					type="search"
					id={ 'search-component-' + instanceId }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					aria-describedby={ describedBy }
					aria-label={ inputLabel ? inputLabel : __( 'Search', __i18n_text_domain__ ) }
					aria-hidden={ ! isOpenUnpinnedOrQueried }
					className={ inputClass }
					placeholder={ placeholder }
					role="searchbox"
					value={ searchValue }
					ref={ searchInput }
					onChange={ onChange }
					onKeyUp={ onKeyUp }
					onKeyDown={ onKeyDown }
					onMouseUp={ onClick }
					onFocus={ onFocus }
					onBlur={ onBlur }
					disabled={ disabled }
					autoCapitalize="none"
					dir={ dir }
					maxLength={ maxLength }
					minLength={ minLength }
					{ ...autocorrectProps }
				/>
				{ renderStylingDiv() }
			</form>
			{ shouldRenderRightOpenIcon ? renderOpenIcon() : renderCloseButton() }
			{ children }
		</div>
	);
};

const Search = React.forwardRef( InnerSearch );
Search.displayName = 'Search';

export default Search;
