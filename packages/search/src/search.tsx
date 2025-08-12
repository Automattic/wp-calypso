/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button, Spinner } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { close, search, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import * as React from 'react';
import { useUpdateEffect } from './utils';
import type {
	ReactNode,
	Ref,
	ChangeEvent,
	FocusEvent,
	FormEvent,
	KeyboardEvent,
	MouseEvent,
} from 'react';

import './style.scss';

/**
 * Internal variables
 */
const SEARCH_DEBOUNCE_MS = 300;

type KeyboardOrMouseEvent =
	| MouseEvent< HTMLButtonElement | HTMLInputElement >
	| KeyboardEvent< HTMLButtonElement | HTMLInputElement >;

const keyListener =
	( methodToCall: ( e: KeyboardOrMouseEvent ) => void ) =>
	( event: KeyboardEvent< HTMLButtonElement | HTMLInputElement > ) => {
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
	childrenBeforeCloseButton?: ReactNode;
	defaultIsOpen?: boolean;
	defaultValue?: string;
	delaySearch?: boolean;
	delayTimeout?: number;
	describedBy?: string;
	dir?: 'ltr' | 'rtl';
	disableAutocorrect?: boolean;
	disabled?: boolean;
	displayOpenAndCloseIcons?: boolean;
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
	onSearchOpen?: () => void;
	onSearchClose?: ( event: KeyboardOrMouseEvent ) => void;
	overlayStyling?: ( search: string ) => React.ReactNode;
	placeholder?: string;
	pinned?: boolean;
	recordEvent?: ( eventName: string ) => void;
	searching?: boolean;
	value?: string;
	searchMode?: 'when-typing' | 'on-enter';
	searchIcon?: ReactNode;
	submitOnOpenIconClick?: boolean;
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

export type ImperativeHandle = {
	focus: () => void;
	blur: () => void;
	clear: () => void;
	setKeyword: ( value: string ) => void;
};

const InnerSearch = (
	{
		children,
		childrenBeforeCloseButton,
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
		displayOpenAndCloseIcons = false,
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
		searchMode = 'when-typing',
		searchIcon,
		submitOnOpenIconClick = false,
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
	const firstRender = React.useRef< boolean >( true );

	React.useImperativeHandle(
		forwardedRef,
		() => ( {
			focus() {
				searchInput.current?.focus();
			},
			blur() {
				searchInput.current?.blur();
			},
			setKeyword( value: string ) {
				setKeyword( value );
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
		if ( searchMode === 'on-enter' ) {
			return;
		}

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

		recordEvent?.( 'Clicked Open Search' );
	};

	const closeSearch = ( event: KeyboardOrMouseEvent ) => {
		event.preventDefault();

		if ( disabled ) {
			return;
		}

		setKeyword( '' );
		if ( 'on-enter' === searchMode ) {
			onSearch?.( '' );
			onSearchChange?.( '' );
		}
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

	// Focus the searchInput when isOpen flips to true, but ignore initial render
	React.useEffect( () => {
		// Do nothing on initial render
		if ( firstRender.current ) {
			firstRender.current = false;
			return;
		}
		if ( isOpen ) {
			// no need to call `onSearchOpen` as it will be called by `onFocus` once the searcbox is focused
			// prevent outlines around the open icon after being clicked
			searchInput.current?.focus();
			openIcon.current?.blur();
		}
	}, [ isOpen ] );

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

	const handleSubmit = ( event?: FormEvent ) => {
		if ( 'on-enter' === searchMode ) {
			onSearch?.( keyword );
			onSearchChange?.( keyword );
		}
		event?.preventDefault();
		event?.stopPropagation();
	};

	const searchValue = keyword;
	const placeholder = placeholderProp || __( 'Search…', __i18n_text_domain__ );
	const isOpenUnpinnedOrQueried = isOpen || ! pinned || searchValue;

	const autocorrectProps = disableAutocorrect && {
		autoComplete: 'off',
		autoCorrect: 'off',
		spellCheck: 'false' as const,
	};

	const searchClass = clsx( 'search-component', className, dir, {
		'is-expanded-to-container': fitsContainer,
		'is-open': isOpenUnpinnedOrQueried,
		'is-searching': searching,
		'is-compact': compact,
		'has-focus': hasFocus,
		'has-open-icon': ! hideOpenIcon,
	} );

	const fadeClass = clsx( 'search-component__input-fade', dir );
	const inputClass = clsx( 'search-component__input', dir );

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

	const renderOpenIcon = () => {
		const enableOpenIcon = pinned && ! isOpen;
		if ( searchIcon ) {
			return searchIcon;
		}

		const onClick = ( props: React.MouseEvent< HTMLButtonElement > ) => {
			if ( submitOnOpenIconClick ) {
				handleSubmit();
			}

			if ( enableOpenIcon ) {
				return openSearch( props );
			}

			return () => searchInput.current?.focus();
		};

		return (
			<Button
				className="search-component__icon-navigation"
				ref={ openIcon }
				onClick={ onClick }
				tabIndex={ enableOpenIcon ? 0 : -1 }
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

	const renderRightIcons = () => {
		const closeButton = renderCloseButton();

		if ( displayOpenAndCloseIcons ) {
			return (
				<>
					{ renderOpenIcon() }
					{ closeButton && (
						<>
							<div className="search-component__icon-navigation-separator">|</div>
							{ closeButton }
						</>
					) }
				</>
			);
		}

		if ( shouldRenderRightOpenIcon ) {
			return renderOpenIcon();
		}

		return closeButton;
	};

	return (
		<div dir={ dir } className={ searchClass } role="search">
			{ openIconSide === 'left' && <Spinner /> }
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
			{ childrenBeforeCloseButton }
			{ openIconSide === 'right' && <Spinner /> }
			{ renderRightIcons() }
			{ children }
		</div>
	);
};

const Search = React.forwardRef( InnerSearch );
Search.displayName = 'Search';

export default Search;
