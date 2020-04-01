/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { Suggestions } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { ENTER, TAB } from '@wordpress/keycodes';
import classnames from 'classnames';

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

interface Props {
	onSubmit: () => void;
}
const VerticalSelect: React.FunctionComponent< Props > = ( { onSubmit } ) => {
	const { __: NO__ } = useI18n();
	const inputRef = React.useRef< HTMLElement >( null );
	const [ isFocused, setIsFocused ] = React.useState< boolean >( false );
	const [ suggestions, setSuggestions ] = React.useState< Suggestion[] >( [] );

	/**
	 * Ref to the <Suggestions />, necessary for handling input events
	 *
	 * This ref is effectively `any` and should therefore be considered _dangerous_.
	 *
	 * TODO: This should be a typed ref to Suggestions, but the component is not typed.
	 *
	 * Using `Suggestions` here would effectively be `any`.
	 */
	const suggestionRef = React.createRef< any >();

	const verticals = useSelect( select =>
		select( VERTICALS_STORE )
			.getVerticals()
			.map( x => ( {
				label: x.vertical_name,
				id: x.vertical_id,
				slug: x.vertical_slug,
			} ) )
	);

	const { siteVertical, siteTitle } = useSelect( select => select( ONBOARD_STORE ).getState() );
	const { setSiteVertical, resetSiteVertical } = useDispatch( ONBOARD_STORE );

	const inputText = inputRef?.current?.innerText || '';
	const isInputEmpty = ! inputText.length;
	const showResults = inputText.length > 2;

	const animatedPlaceholder = useTyper(
		[ NO__( 'football' ), NO__( 'shopping' ), NO__( 'cars' ), NO__( 'design' ), NO__( 'travel' ) ],
		isInputEmpty
	);

	const updateSuggestions = ( inputValue: string ) => {
		if ( inputValue.length < 3 ) {
			setSuggestions( [] );
			return;
		}

		const normalizedInputValue = inputValue.toLowerCase();

		let newSuggestions = verticals.filter( vertical =>
			vertical.label.toLowerCase().includes( normalizedInputValue )
		);

		// Does the verticals list include an exact match? If it doesn't, we prepend the user-suppied
		// vertical to the list.
		if (
			! newSuggestions.some( suggestion => suggestion.label.toLowerCase() === normalizedInputValue )
		) {
			// User-supplied verticals don't have IDs.
			newSuggestions.unshift( { label: inputValue.trim() } );
		}

		// If there is only one suggestion and that suggestion matches the user input value,
		// do not show any suggestions.
		if (
			newSuggestions.length === 1 &&
			newSuggestions[ 0 ].label.toLowerCase() === normalizedInputValue
		) {
			newSuggestions = [];
		}

		setSuggestions( newSuggestions );
	};
	const handleInputKeyUpEvent = ( e: React.KeyboardEvent< HTMLSpanElement > ) => {
		const input = e.currentTarget.innerText.trim();
		if ( ! input.length ) {
			resetSiteVertical();
		}
		updateSuggestions( input );
	};

	const handleSelect = ( vertical: SiteVertical ) => {
		setSiteVertical( vertical );
		setIsFocused( false ); // prevent executing handleBlur()
		onSubmit();
	};

	const handleInputKeyDownEvent = ( e: React.KeyboardEvent< HTMLSpanElement > ) => {
		const input = e.currentTarget.innerText.trim();

		if ( suggestionRef.current ) {
			suggestionRef.current.handleKeyEvent( e );
		}
		if ( e.keyCode === ENTER ) {
			e.preventDefault();
			input.length && ! suggestions.length && handleSelect( { label: input } );
			return;
		}
		if ( e.keyCode === TAB ) {
			e.preventDefault();
		}
	};

	const handleBlur = () => {
		// if ( isFocused ) {
		// 	const vertical = suggestions.find( ( { label } ) =>
		// 		label.toLowerCase().includes( normalizedInputValue )
		// 	) ?? { label: inputValue.trim() };
		// 	handleSelect( vertical );
		// }
	};

	React.useEffect( () => {
		if ( isInputEmpty ) {
			inputRef?.current?.focus();
		} else {
			inputRef.current.innerText = siteVertical?.label || '';
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect( () => {
		inputRef.current.innerText = siteVertical?.label || '';
	}, [ siteVertical, inputRef ] );

	// TODO: Write a better translators comment.
	// translators: Form input for a site's topic where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = NO__( 'My site is about <Input />' );
	const madlib = __experimentalCreateInterpolateElement( madlibTemplate, {
		Input: (
			<span className="vertical-select__suggestions-wrapper">
				<span
					role="textbox"
					tabIndex={ 0 }
					contentEditable
					ref={ inputRef }
					/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
					className="madlib__input"
					onBlur={ handleBlur }
					onFocus={ () => setIsFocused( true ) }
					onKeyDown={ handleInputKeyDownEvent }
					onKeyUp={ handleInputKeyUpEvent }
					spellCheck={ false }
				/>
				{ isInputEmpty && (
					<span className="vertical-select__placeholder">{ animatedPlaceholder }</span>
				) }
				<div className="vertical-select__suggestions">
					{ isFocused && !! verticals.length && (
						<Suggestions
							ref={ suggestionRef }
							query={ inputRef?.current?.innerText }
							suggestions={ suggestions }
							suggest={ handleSelect }
							title={ NO__( 'Suggestions' ) }
						/>
					) }
				</div>
			</span>
		),
	} );

	const showArrow = isFocused && ! siteTitle && ! siteVertical && showResults;

	return (
		<form
			className={ classnames( 'vertical-select', {
				'vertical-select--without-value': isInputEmpty,
			} ) }
		>
			{ madlib }
			{ /* us visibility to keep the layout fixed with and without the arrow */ }
			<Arrow
				className="vertical-select__arrow"
				style={ { visibility: showArrow ? 'visible' : 'hidden' } }
			/>
		</form>
	);
};

export default VerticalSelect;
