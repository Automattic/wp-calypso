/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { Suggestions } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import Textarea from 'react-autosize-textarea';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../../stores/onboard';
import { Verticals } from '@automattic/data-stores';
import { SiteVertical } from '../../../stores/onboard/types';
import useTyper from '../../../hooks/use-typer';
import Arrow from '../arrow';

/**
 * Style dependencies
 */
import './style.scss';

type Suggestion = SiteVertical & { category?: string };

const VERTICALS_STORE = Verticals.register();

const VerticalSelect: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const inputRef = React.useRef< HTMLTextAreaElement >( null );
	const [ isFocused, setIsFocused ] = React.useState< boolean >( false );

	/**
	 * Ref to the <Suggestions />, necessary for handling input events
	 *
	 * This ref is effectively `any` and should therefore be considered _dangerous_.
	 *
	 * TODO: This should be a typed ref to Suggestions, but the component is not typed.
	 *
	 * Using `Suggestions` here would effectively be `any`.
	 */
	const suggestionRef = React.createRef< HTMLTextAreaElement | any >();

	const verticals = useSelect( select =>
		select( VERTICALS_STORE )
			.getVerticals()
			.map( x => ( {
				label: x.vertical_name,
				id: x.vertical_id,
			} ) )
	);

	const { siteVertical, siteTitle } = useSelect( select => select( ONBOARD_STORE ).getState() );
	const { setSiteVertical, resetSiteVertical } = useDispatch( ONBOARD_STORE );

	const [ inputValue, setInputValue ] = React.useState( siteVertical?.label ?? '' );

	const animatedPlaceholder = useTyper(
		[ NO__( 'football' ), NO__( 'shopping' ), NO__( 'cars' ), NO__( 'design' ), NO__( 'travel' ) ],
		inputValue.length === 0
	);

	const normalizedInputValue = inputValue.trim().toLowerCase();

	const hasValue = !! normalizedInputValue.length;

	const showArrow = isFocused && ! siteTitle && ! siteVertical && inputValue.length > 2;

	let suggestions: Suggestion[];

	if ( ! normalizedInputValue ) {
		suggestions = [];
		resetSiteVertical();
	} else {
		suggestions = verticals.filter( vertical =>
			vertical.label.toLowerCase().includes( normalizedInputValue )
		);

		// Does the verticals list include an exact match? If it doesn't, we prepend the user-suppied
		// vertical to the list.
		if (
			! suggestions.some( suggestion => suggestion.label.toLowerCase() === normalizedInputValue )
		) {
			// User-supplied verticals don't have IDs.
			suggestions.unshift( { label: inputValue.trim() } );
		}

		// If there is only one suggestion and that suggestion matches the user input value,
		// do not show any suggestions.
		if (
			suggestions.length === 1 &&
			suggestions[ 0 ].label.toLowerCase() === normalizedInputValue
		) {
			suggestions = [];
		}
	}

	const handleSelect = ( vertical: SiteVertical ) => {
		setSiteVertical( vertical );
		setInputValue( vertical.label );
		setIsFocused( false ); // prevent executing handleBlur()
	};

	const handleSuggestionChangeEvent = ( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
		setInputValue( e.target.value );
	};

	const handleInputKeyDownEvent = ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
		if ( e.keyCode === ENTER ) {
			e.preventDefault();
			handleSelect( { label: inputValue } );
			return;
		}
		if ( suggestionRef.current ) {
			suggestionRef.current.handleKeyEvent( e );
		}
	};

	const handleBlur = () => {
		if ( isFocused ) {
			const vertical = suggestions.find( ( { label } ) =>
				label.toLowerCase().includes( normalizedInputValue )
			) ?? { label: inputValue.trim() };

			handleSelect( vertical );
		}
	};

	React.useEffect( () => {
		if ( ! hasValue ) {
			inputRef?.current?.focus();
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// TODO: Write a better translators comment.
	// translators: Form input for a site's topic where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = NO__( 'My site is about <Input />' );
	const madlib = __experimentalCreateInterpolateElement( madlibTemplate, {
		Input: (
			<div className="vertical-select__suggestions-wrapper madlib__input-wrapper">
				<Textarea
					ref={ inputRef }
					/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
					className="madlib__input"
					autoComplete="off"
					autoCapitalize="off"
					spellCheck="false"
					onBlur={ handleBlur }
					onFocus={ () => setIsFocused( true ) }
					onChange={ handleSuggestionChangeEvent }
					onKeyDown={ handleInputKeyDownEvent }
					placeholder={ animatedPlaceholder }
					value={ inputValue }
					cols={ showArrow && inputValue.length < 10 ? inputValue.length + 1 : undefined }
				/>
				<div className="vertical-select__suggestions">
					{ isFocused && !! verticals.length && (
						<Suggestions
							ref={ suggestionRef }
							query={ inputValue }
							suggestions={ suggestions }
							suggest={ handleSelect }
							title={ NO__( 'Suggestions' ) }
						/>
					) }
				</div>
			</div>
		),
	} );

	return (
		<form
			className={ classnames( 'vertical-select', {
				'vertical-select--without-value': ! hasValue,
			} ) }
		>
			{ madlib }
			{ showArrow && <Arrow /> }
		</form>
	);
};

export default VerticalSelect;
