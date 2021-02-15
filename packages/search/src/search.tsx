/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

import { useI18n, I18nReact } from '@automattic/react-i18n';
import classNames from 'classnames';
import React from 'react';
import type {
	RefObject,
	MutableRefObject,
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
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

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
	__: I18nReact[ '__' ];
	autoFocus?: boolean;
	className?: string;
	compact?: boolean;
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
	onSearchOpen?: (
		event?:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	) => void;
	onSearchClose?: (
		event:
			| MouseEvent< HTMLButtonElement | HTMLInputElement >
			| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
	) => void;
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

const InnerSearch: React.ForwardRefRenderFunction< ImperativeHandle, Props > = (
	{
		delaySearch,
		disabled,
		pinned,
		onSearchClose,
		onSearchChange,
		onSearch: onSearchProp,
		onBlur: onBlurProp,
		onKeyDown: onKeyDownProp,
		onClick,
		describedBy,
		delayTimeout,
		defaultValue = '',
		defaultIsOpen = false,
		autoFocus = false,
		onSearchOpen,
		recordEvent,
		overlayStyling,
		placeholder: placeholderProp,
		inputLabel,
		disableAutocorrect,
		className,
		dir,
		fitsContainer,
		searching,
		compact,
		hideOpenIcon,
		openIconSide,
		minLength,
		maxLength,
		hideClose,
	},
	forwardedRef
) => {
	const { __ } = useI18n();
	const [ keyword, setKeyword ] = React.useState( defaultValue );
	const [ isOpen, setIsOpen ] = React.useState( defaultIsOpen );
	const [ hasFocus, setHasFocus ] = React.useState( autoFocus );

	const instanceId = useInstanceId( InnerSearch, 'search' );
	const searchInput: MutableRefObject< HTMLInputElement | null > = React.useRef( null );
	const openIcon: RefObject< HTMLButtonElement | null > = React.useRef( null );
	const overlay: RefObject< HTMLDivElement | null > = React.useRef( null );

	const focus = React.useCallback( () => {
		// if we call focus before the element has been entirely synced up with the DOM, we stand a decent chance of
		// causing the browser to scroll somewhere odd. Instead, defer the focus until a future turn of the event loop.
		setTimeout( () => searchInput.current?.focus(), 0 );
	}, [] );

	const blur = React.useCallback( () => searchInput.current?.blur(), [] );

	const clear = React.useCallback( (): void => setKeyword( '' ), [] );

	React.useImperativeHandle(
		forwardedRef,
		() => ( {
			focus,
			blur,
			clear,
		} ),
		[ focus, blur, clear ]
	);

	const doSearch: ( ( search: string ) => void ) & { cancel?: () => void } = React.useMemo(
		() => ( delaySearch ? debounce( onSearchProp, delayTimeout ) : onSearchProp ),
		[ onSearchProp, delayTimeout, delaySearch ]
	);

	useUpdateEffect( () => {
		if ( keyword ) {
			doSearch( keyword );
		} else {
			// explicitly bypass debouncing when keyword is empty
			if ( delaySearch ) {
				// Cancel any pending debounce
				doSearch.cancel?.();
			}

			doSearch( keyword );
		}

		onSearchChange?.( keyword );
	}, [ doSearch, keyword, onSearchChange ] );

	const openSearch = React.useCallback(
		(
			event:
				| MouseEvent< HTMLButtonElement | HTMLInputElement >
				| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
		): void => {
			event.preventDefault();

			setKeyword( '' );
			setIsOpen( true );

			focus();
			onSearchOpen?.( event );
			// prevent outlines around the open icon after being clicked
			openIcon.current?.blur();
			recordEvent?.( 'Clicked Open Search' );
		},
		[ onSearchOpen, recordEvent, focus ]
	);

	const closeSearch = React.useCallback(
		(
			event:
				| MouseEvent< HTMLButtonElement | HTMLInputElement >
				| KeyboardEvent< HTMLButtonElement | HTMLInputElement >
		): void => {
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
		},
		[ disabled, pinned, onSearchClose, recordEvent ]
	);

	const closeListener = React.useMemo( () => keyListener( closeSearch ), [ closeSearch ] );
	const openListener = React.useMemo( () => keyListener( openSearch ), [ openSearch ] );

	const scrollOverlay = React.useCallback( (): void => {
		overlay &&
			window.requestAnimationFrame( () => {
				if ( overlay.current && searchInput.current ) {
					overlay.current.scrollLeft = getScrollLeft( searchInput.current );
				}
			} );
	}, [] );

	React.useEffect( () => {
		scrollOverlay();
	}, [ keyword, isOpen, hasFocus, scrollOverlay ] );

	const onBlur = React.useCallback(
		( event: FocusEvent< HTMLInputElement > ): void => {
			if ( onBlurProp ) {
				onBlurProp( event );
			}

			setHasFocus( false );
		},
		[ onBlurProp ]
	);

	const onChange = React.useCallback( ( event: ChangeEvent< HTMLInputElement > ): void => {
		setKeyword( event.target.value );
	}, [] );

	const onKeyUp = React.useCallback(
		( event: KeyboardEvent< HTMLInputElement > ): void => {
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
		},
		[ pinned, blur, closeListener, scrollOverlay ]
	);

	const onKeyDown = React.useCallback(
		( event: KeyboardEvent< HTMLInputElement > ): void => {
			scrollOverlay();

			if (
				event.key === 'Escape' &&
				// currentTarget will be the input element, rather than target which can be anything
				event.currentTarget?.value === ''
			) {
				closeListener( event );
			}

			onKeyDownProp?.( event );
		},
		[ scrollOverlay, closeListener, onKeyDownProp ]
	);

	// Puts the cursor at end of the text when starting
	// with `initialValue` set.
	const onFocus = React.useCallback( (): void => {
		setHasFocus( true );
		onSearchOpen?.();

		if ( ! searchInput.current ) {
			return;
		}

		const setValue = searchInput.current.value ?? '';
		if ( setValue ) {
			// Firefox needs clear or won't move cursor to end
			searchInput.current.value = '';
			searchInput.current.value = setValue;
		}
	}, [ onSearchOpen ] );

	const handleSubmit = React.useCallback( ( event: FormEvent ): void => {
		event.preventDefault();
		event.stopPropagation();
	}, [] );

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
				<div
					className="search-component__text-overlay"
					ref={ overlay as RefObject< HTMLDivElement > }
				>
					{ overlayStyling( keyword ) }
				</div>
			);
		}
		return null;
	};

	const renderOpenIcon = () => {
		const enableOpenIcon = pinned && ! isOpen;

		return (
			<Button
				className="search-component__icon-navigation"
				ref={ openIcon as RefObject< HTMLButtonElement > }
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
		</div>
	);
};

export const Search = React.forwardRef( InnerSearch );
Search.defaultProps = {
	autoFocus: false,
	compact: false,
	delaySearch: false,
	delayTimeout: SEARCH_DEBOUNCE_MS,
	describedBy: undefined,
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
	openIconSide: 'left' as const,
	//undefined value for overlayStyling is an optimization that will
	//disable overlay scrolling calculation when no overlay is provided.
	overlayStyling: undefined,
	pinned: false,
	recordEvent: noop,
	searching: false,
};

export default Search;
