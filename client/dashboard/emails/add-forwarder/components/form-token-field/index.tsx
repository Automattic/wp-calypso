import { speak } from '@wordpress/a11y';
import { FlexItem, __experimentalSpacer as Spacer } from '@wordpress/components';
import { useDebounce, useInstanceId, usePrevious } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import isShallowEqual from '@wordpress/is-shallow-equal';
import clsx from 'clsx';
import { TokensAndInputWrapperFlex } from './styles';
import SuggestionsList from './suggestions-list';
import Token from './token';
import TokenInput from './token-input';
import { StyledHelp, StyledLabel } from './utils/base-control-styles';
import { withIgnoreIMEEvents } from './utils/with-ignore-ime-events';
import type { FormTokenFieldProps, TokenItem } from './types';
import type { KeyboardEvent, MouseEvent, TouchEvent, FocusEvent } from 'react';

const identity = ( value: string ) => value;

/**
 * A `FormTokenField` is a field similar to the tags and categories fields in the interim editor chrome,
 * or the "to" field in Mail on OS X. Tokens can be entered by typing them or selecting them from a list of suggested tokens.
 *
 * Up to one hundred suggestions that match what the user has typed so far will be shown from which the user can pick from (auto-complete).
 * Tokens are separated by the "," character. Suggestions can be selected with the up or down arrows and added with the tab or enter key.
 *
 * The `value` property is handled in a manner similar to controlled form components.
 * See [Forms](https://react.dev/reference/react-dom/components#form-components) in the React Documentation for more information.
 */
export function FormTokenField( props: FormTokenFieldProps ) {
	const {
		autoCapitalize,
		autoComplete,
		maxLength,
		placeholder,
		label = __( 'Add item' ),
		className,
		suggestions = [],
		maxSuggestions = 100,
		value = [],
		displayTransform = identity,
		saveTransform = ( token ) => token.trim(),
		onChange = () => {},
		onInputChange = () => {},
		onFocus = undefined,
		isBorderless = false,
		disabled = false,
		tokenizeOnSpace = false,
		messages = {
			added: __( 'Item added.' ),
			removed: __( 'Item removed.' ),
			remove: __( 'Remove item' ),
			__experimentalInvalid: __( 'Invalid item' ),
		},
		__experimentalRenderItem,
		__experimentalExpandOnFocus = false,
		__experimentalValidateInput = () => true,
		__experimentalShowHowTo = true,
		__next40pxDefaultSize = false,
		__experimentalAutoSelectFirstMatch = false,
		__nextHasNoMarginBottom = false,
		tokenizeOnBlur = false,
	} = props;

	const instanceId = useInstanceId( FormTokenField );

	// We reset to these initial values again in the onBlur
	const [ incompleteTokenValue, setIncompleteTokenValue ] = useState( '' );
	const [ inputOffsetFromEnd, setInputOffsetFromEnd ] = useState( 0 );
	const [ isActive, setIsActive ] = useState( false );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ selectedSuggestionIndex, setSelectedSuggestionIndex ] = useState( -1 );
	const [ selectedSuggestionScroll, setSelectedSuggestionScroll ] = useState( false );

	const prevSuggestions = usePrevious< string[] >( suggestions );
	const prevValue = usePrevious< ( string | TokenItem )[] >( value );

	const input = useRef< HTMLInputElement >( null );
	const tokensAndInput = useRef< HTMLInputElement >( null );

	const debouncedSpeak = useDebounce( speak, 500 );

	useEffect( () => {
		// Make sure to focus the input when the isActive state is true.
		if ( isActive && ! hasFocus() ) {
			focus();
		}
	}, [ isActive ] );

	useEffect( () => {
		const suggestionsDidUpdate = ! isShallowEqual( suggestions, prevSuggestions || [] );

		if ( suggestionsDidUpdate || value !== prevValue ) {
			updateSuggestions( suggestionsDidUpdate );
		}

		// TODO: updateSuggestions() should first be refactored so its actual deps are clearer.
	}, [ suggestions, prevSuggestions, value, prevValue ] );

	useEffect( () => {
		updateSuggestions();
	}, [ incompleteTokenValue ] );

	useEffect( () => {
		updateSuggestions();
	}, [ __experimentalAutoSelectFirstMatch ] );

	if ( disabled && isActive ) {
		setIsActive( false );
		setIncompleteTokenValue( '' );
	}

	function focus() {
		input.current?.focus();
	}

	function hasFocus() {
		return input.current === input.current?.ownerDocument.activeElement;
	}

	function onFocusHandler( event: FocusEvent ) {
		// If focus is on the input or on the container, set the isActive state to true.
		if ( hasFocus() || event.target === tokensAndInput.current ) {
			setIsActive( true );
			setIsExpanded( __experimentalExpandOnFocus || isExpanded );
		} else {
			/*
			 * Otherwise, focus is on one of the token "remove" buttons and we
			 * set the isActive state to false to prevent the input to be
			 * re-focused, see componentDidUpdate().
			 */
			setIsActive( false );
		}

		if ( 'function' === typeof onFocus ) {
			onFocus( event );
		}
	}

	function onBlur( event: FocusEvent ) {
		if ( inputHasValidValue() && __experimentalValidateInput( incompleteTokenValue ) ) {
			setIsActive( false );
			if ( tokenizeOnBlur && inputHasValidValue() ) {
				addNewToken( incompleteTokenValue );
			}
		} else {
			// Reset to initial state
			setIncompleteTokenValue( '' );
			setInputOffsetFromEnd( 0 );
			setIsActive( false );

			if ( __experimentalExpandOnFocus ) {
				// If `__experimentalExpandOnFocus` is true, don't close the suggestions list when
				// the user clicks on it (`tokensAndInput` will be the element that caused the blur).
				const hasFocusWithin = event.relatedTarget === tokensAndInput.current;
				setIsExpanded( hasFocusWithin );
			} else {
				// Else collapse the suggestion list. This will result in the suggestion list closing
				// after a suggestion has been submitted since that causes a blur.
				setIsExpanded( false );
			}

			setSelectedSuggestionIndex( -1 );
			setSelectedSuggestionScroll( false );
		}
	}

	function onKeyDown( event: KeyboardEvent ) {
		let preventDefault = false;

		if ( event.defaultPrevented ) {
			return;
		}
		switch ( event.key ) {
			case 'Backspace':
				preventDefault = handleDeleteKey( deleteTokenBeforeInput );
				break;
			case 'Enter':
				preventDefault = addCurrentToken();
				break;
			case 'ArrowLeft':
				preventDefault = handleLeftArrowKey();
				break;
			case 'ArrowUp':
				preventDefault = handleUpArrowKey();
				break;
			case 'ArrowRight':
				preventDefault = handleRightArrowKey();
				break;
			case 'ArrowDown':
				preventDefault = handleDownArrowKey();
				break;
			case 'Delete':
				preventDefault = handleDeleteKey( deleteTokenAfterInput );
				break;
			case 'Space':
				if ( tokenizeOnSpace ) {
					preventDefault = addCurrentToken();
				}
				break;
			case 'Escape':
				preventDefault = handleEscapeKey( event );
				break;
			case 'Tab':
				preventDefault = handleTabKey( event );
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	}

	function onKeyPress( event: KeyboardEvent ) {
		let preventDefault = false;

		switch ( event.key ) {
			case ',':
				preventDefault = handleCommaKey();
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	}

	function onContainerTouched( event: MouseEvent | TouchEvent ) {
		// Prevent clicking/touching the tokensAndInput container from blurring
		// the input and adding the current token.
		if ( event.target === tokensAndInput.current && isActive ) {
			event.preventDefault();
		}
	}

	function onTokenClickRemove( event: { value: string } ) {
		deleteToken( event.value );
		focus();
	}

	function onSuggestionHovered( suggestion: string ) {
		const index = getMatchingSuggestions().indexOf( suggestion );

		if ( index >= 0 ) {
			setSelectedSuggestionIndex( index );
			setSelectedSuggestionScroll( false );
		}
	}

	function onSuggestionSelected( suggestion: string ) {
		addNewToken( suggestion );
	}

	function onInputChangeHandler( event: { value: string } ) {
		const text = event.value;
		const separator = tokenizeOnSpace ? /[ ,\t]+/ : /[,\t]+/;
		const items = text.split( separator );
		const tokenValue = items[ items.length - 1 ] || '';

		if ( items.length > 1 ) {
			addNewTokens( items.slice( 0, -1 ) );
		}
		setIncompleteTokenValue( tokenValue );
		onInputChange( tokenValue );
	}

	function handleDeleteKey( _deleteToken: () => void ) {
		let preventDefault = false;
		if ( hasFocus() && isInputEmpty() ) {
			_deleteToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleLeftArrowKey() {
		let preventDefault = false;
		if ( isInputEmpty() ) {
			moveInputBeforePreviousToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleRightArrowKey() {
		let preventDefault = false;
		if ( isInputEmpty() ) {
			moveInputAfterNextToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleUpArrowKey() {
		setSelectedSuggestionIndex( ( index ) => {
			return (
				( index === 0
					? getMatchingSuggestions(
							incompleteTokenValue,
							suggestions,
							value,
							maxSuggestions,
							saveTransform
					  ).length
					: index ) - 1
			);
		} );
		setSelectedSuggestionScroll( true );

		return true; // PreventDefault.
	}

	function handleDownArrowKey() {
		setSelectedSuggestionIndex( ( index ) => {
			return (
				( index + 1 ) %
				getMatchingSuggestions(
					incompleteTokenValue,
					suggestions,
					value,
					maxSuggestions,
					saveTransform
				).length
			);
		} );

		setSelectedSuggestionScroll( true );
		return true; // PreventDefault.
	}

	function collapseSuggestionsList( event: KeyboardEvent ) {
		if ( event.target instanceof HTMLInputElement ) {
			setIncompleteTokenValue( event.target.value );
			setIsExpanded( false );
			setSelectedSuggestionIndex( -1 );
			setSelectedSuggestionScroll( false );
		}
	}

	function handleEscapeKey( event: KeyboardEvent ) {
		collapseSuggestionsList( event );
		return true; // PreventDefault.
	}

	function handleTabKey( event: KeyboardEvent ) {
		collapseSuggestionsList( event );
		return false; // Do not prevent the default behavior.
	}

	function handleCommaKey() {
		if ( inputHasValidValue() ) {
			addNewToken( incompleteTokenValue );
		}

		return true; // PreventDefault.
	}

	function moveInputToIndex( index: number ) {
		setInputOffsetFromEnd( value.length - Math.max( index, -1 ) - 1 );
	}

	function moveInputBeforePreviousToken() {
		setInputOffsetFromEnd( ( prevInputOffsetFromEnd ) => {
			return Math.min( prevInputOffsetFromEnd + 1, value.length );
		} );
	}

	function moveInputAfterNextToken() {
		setInputOffsetFromEnd( ( prevInputOffsetFromEnd ) => {
			return Math.max( prevInputOffsetFromEnd - 1, 0 );
		} );
	}

	function deleteTokenBeforeInput() {
		const index = getIndexOfInput() - 1;

		if ( index > -1 ) {
			deleteToken( value[ index ] );
		}
	}

	function deleteTokenAfterInput() {
		const index = getIndexOfInput();

		if ( index < value.length ) {
			deleteToken( value[ index ] );
			// Update input offset since it's the offset from the last token.
			moveInputToIndex( index );
		}
	}

	function addCurrentToken() {
		let preventDefault = false;
		const selectedSuggestion = getSelectedSuggestion();

		if ( selectedSuggestion ) {
			addNewToken( selectedSuggestion );
			preventDefault = true;
		} else if ( inputHasValidValue() ) {
			addNewToken( incompleteTokenValue );
			preventDefault = true;
		}

		return preventDefault;
	}

	function addNewTokens( tokens: string[] ) {
		const tokensToAdd = [
			...new Set(
				tokens
					.map( saveTransform )
					.filter( Boolean )
					.filter( ( token ) => ! valueContainsToken( token ) )
			),
		];

		if ( tokensToAdd.length > 0 ) {
			const newValue = [ ...value ];
			newValue.splice( getIndexOfInput(), 0, ...tokensToAdd );
			onChange( newValue );
		}
	}

	function addNewToken( token: string ) {
		if ( ! __experimentalValidateInput( token ) ) {
			speak( messages.__experimentalInvalid, 'assertive' );
			return;
		}
		addNewTokens( [ token ] );
		speak( messages.added, 'assertive' );

		setIncompleteTokenValue( '' );
		setSelectedSuggestionIndex( -1 );
		setSelectedSuggestionScroll( false );
		setIsExpanded( ! __experimentalExpandOnFocus );

		if ( isActive && ! tokenizeOnBlur ) {
			focus();
		}
	}

	function deleteToken( token: string | TokenItem ) {
		const newTokens = value.filter( ( item ) => {
			return getTokenValue( item ) !== getTokenValue( token );
		} );
		onChange( newTokens );
		speak( messages.removed, 'assertive' );
	}

	function getTokenValue( token: { value: string } | string ) {
		if ( 'object' === typeof token ) {
			return token.value;
		}

		return token;
	}

	function getMatchingSuggestions(
		searchValue = incompleteTokenValue,
		_suggestions = suggestions,
		_value = value,
		_maxSuggestions = maxSuggestions,
		_saveTransform = saveTransform
	) {
		let match = _saveTransform( searchValue );
		const startsWithMatch: string[] = [];
		const containsMatch: string[] = [];
		const normalizedValue = _value.map( ( item ) => {
			if ( typeof item === 'string' ) {
				return item;
			}
			return item.value;
		} );

		if ( match.length === 0 ) {
			_suggestions = _suggestions.filter(
				( suggestion ) => ! normalizedValue.includes( suggestion )
			);
		} else {
			match = match.normalize( 'NFKC' ).toLocaleLowerCase();

			_suggestions.forEach( ( suggestion ) => {
				const index = suggestion.normalize( 'NFKC' ).toLocaleLowerCase().indexOf( match );
				if ( normalizedValue.indexOf( suggestion ) === -1 ) {
					if ( index === 0 ) {
						startsWithMatch.push( suggestion );
					} else if ( index > 0 ) {
						containsMatch.push( suggestion );
					}
				}
			} );

			_suggestions = startsWithMatch.concat( containsMatch );
		}

		return _suggestions.slice( 0, _maxSuggestions );
	}

	function getSelectedSuggestion() {
		if ( selectedSuggestionIndex !== -1 ) {
			return getMatchingSuggestions()[ selectedSuggestionIndex ];
		}

		return undefined;
	}

	function valueContainsToken( token: string ) {
		return value.some( ( item ) => {
			return getTokenValue( token ) === getTokenValue( item );
		} );
	}

	function getIndexOfInput() {
		return value.length - inputOffsetFromEnd;
	}

	function isInputEmpty() {
		return incompleteTokenValue.length === 0;
	}

	function inputHasValidValue() {
		return saveTransform( incompleteTokenValue ).length > 0;
	}

	function updateSuggestions( resetSelectedSuggestion = true ) {
		const inputHasMinimumChars = incompleteTokenValue.trim().length > 1;
		const matchingSuggestions = getMatchingSuggestions( incompleteTokenValue );
		const hasMatchingSuggestions = matchingSuggestions.length > 0;

		const shouldExpandIfFocuses = hasFocus() && __experimentalExpandOnFocus;
		setIsExpanded( shouldExpandIfFocuses || ( inputHasMinimumChars && hasMatchingSuggestions ) );

		if ( resetSelectedSuggestion ) {
			if ( __experimentalAutoSelectFirstMatch && inputHasMinimumChars && hasMatchingSuggestions ) {
				setSelectedSuggestionIndex( 0 );
				setSelectedSuggestionScroll( true );
			} else {
				setSelectedSuggestionIndex( -1 );
				setSelectedSuggestionScroll( false );
			}
		}

		if ( inputHasMinimumChars ) {
			const message = hasMatchingSuggestions
				? sprintf(
						/* translators: %d: number of results. */
						_n(
							'%d result found, use up and down arrow keys to navigate.',
							'%d results found, use up and down arrow keys to navigate.',
							matchingSuggestions.length
						),
						matchingSuggestions.length
				  )
				: __( 'No results.' );

			debouncedSpeak( message, 'assertive' );
		}
	}

	function renderTokensAndInput() {
		const components = value.map( renderToken );
		components.splice( getIndexOfInput(), 0, renderInput() );

		return components;
	}

	function renderToken(
		token: string | TokenItem,
		index: number,
		tokens: ( string | TokenItem )[]
	) {
		const _value = getTokenValue( token );
		const status = typeof token !== 'string' ? token.status : undefined;
		const termPosition = index + 1;
		const termsCount = tokens.length;

		return (
			<FlexItem key={ 'token-' + _value }>
				<Token
					value={ _value }
					status={ status }
					title={ typeof token !== 'string' ? token.title : undefined }
					displayTransform={ displayTransform }
					onClickRemove={ onTokenClickRemove }
					isBorderless={ ( typeof token !== 'string' && token.isBorderless ) || isBorderless }
					onMouseEnter={ typeof token !== 'string' ? token.onMouseEnter : undefined }
					onMouseLeave={ typeof token !== 'string' ? token.onMouseLeave : undefined }
					disabled={ 'error' !== status && disabled }
					messages={ messages }
					termsCount={ termsCount }
					termPosition={ termPosition }
				/>
			</FlexItem>
		);
	}

	function renderInput() {
		const inputProps = {
			instanceId,
			autoCapitalize,
			autoComplete,
			placeholder: value.length === 0 ? placeholder : '',
			disabled,
			value: incompleteTokenValue,
			onBlur,
			isExpanded,
			selectedSuggestionIndex,
		};

		return (
			<TokenInput
				key="input"
				{ ...inputProps }
				onChange={ ! ( maxLength && value.length >= maxLength ) ? onInputChangeHandler : undefined }
				ref={ input }
			/>
		);
	}

	const classes = clsx( className, 'components-form-token-field__input-container', {
		'is-active': isActive,
		'is-disabled': disabled,
	} );

	let tokenFieldProps = {
		className: 'components-form-token-field',
		tabIndex: -1,
	};
	const matchingSuggestions = getMatchingSuggestions();

	if ( ! disabled ) {
		tokenFieldProps = Object.assign( {}, tokenFieldProps, {
			onKeyDown: withIgnoreIMEEvents( onKeyDown ),
			onKeyPress,
			onFocus: onFocusHandler,
		} );
	}

	// Disable reason: There is no appropriate role which describes the
	// input container intended accessible usability.
	// TODO: Refactor click detection to use blur to stop propagation.
	/* eslint-disable jsx-a11y/no-static-element-interactions */
	return (
		<div { ...tokenFieldProps }>
			{ label && (
				<StyledLabel
					htmlFor={ `components-form-token-input-${ instanceId }` }
					className="components-form-token-field__label"
				>
					{ label }
				</StyledLabel>
			) }
			<div
				ref={ tokensAndInput }
				className={ classes }
				tabIndex={ -1 }
				onMouseDown={ onContainerTouched }
				onTouchStart={ onContainerTouched }
			>
				<TokensAndInputWrapperFlex
					justify="flex-start"
					align="center"
					gap={ 1 }
					wrap
					__next40pxDefaultSize={ __next40pxDefaultSize }
					hasTokens={ !! value.length }
				>
					{ renderTokensAndInput() }
				</TokensAndInputWrapperFlex>
				{ isExpanded && (
					<SuggestionsList
						instanceId={ instanceId }
						match={ saveTransform( incompleteTokenValue ) }
						displayTransform={ displayTransform }
						suggestions={ matchingSuggestions }
						selectedIndex={ selectedSuggestionIndex }
						scrollIntoView={ selectedSuggestionScroll }
						onHover={ onSuggestionHovered }
						onSelect={ onSuggestionSelected }
						__experimentalRenderItem={ __experimentalRenderItem }
					/>
				) }
			</div>
			{ ! __nextHasNoMarginBottom && <Spacer marginBottom={ 2 } /> }
			{ __experimentalShowHowTo && (
				<StyledHelp
					id={ `components-form-token-suggestions-howto-${ instanceId }` }
					className="components-form-token-field__help"
					__nextHasNoMarginBottom={ __nextHasNoMarginBottom }
				>
					{ tokenizeOnSpace
						? __( 'Separate with commas, spaces, or the Enter key.' )
						: __( 'Separate with commas or the Enter key.' ) }
				</StyledHelp>
			) }
		</div>
	);
	/* eslint-enable jsx-a11y/no-static-element-interactions */
}

export default FormTokenField;
