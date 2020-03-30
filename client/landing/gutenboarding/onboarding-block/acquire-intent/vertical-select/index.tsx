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
	const inputRef = React.useRef< HTMLInputElement >( null );
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
	const suggestionRef = React.createRef< any >();

	const verticals = useSelect( select =>
		select( VERTICALS_STORE )
			.getVerticals()
			.map( x => ( {
				label: x.vertical_name,
				id: x.vertical_id,
			} ) )
	);

	const { siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );
	const { setSiteVertical, resetSiteVertical } = useDispatch( ONBOARD_STORE );

	const [ inputValue, setInputValue ] = React.useState( siteVertical?.label ?? '' );

	const animatedPlaceholder = useTyper(
		[ NO__( 'football' ), NO__( 'shopping' ), NO__( 'cars' ), NO__( 'design' ), NO__( 'travel' ) ],
		inputValue.length === 0
	);

	const normalizedInputValue = inputValue.trim().toLowerCase();
	const hasValue = !! normalizedInputValue.length;

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
		onSubmit();
	};

	const handleSuggestionChangeEvent = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setInputValue( e.target.value );
	};

	const handleInputKeyDownEvent = ( e: React.KeyboardEvent< HTMLInputElement > ) => {
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
			<span className="vertical-select__suggestions-wrapper">
				<input
					ref={ inputRef }
					/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
					className="madlib__input"
					autoComplete="off"
					style={ {
						width: `${ inputValue.length * 0.85 }ch`,
					} }
					onBlur={ handleBlur }
					onFocus={ () => setIsFocused( true ) }
					onChange={ handleSuggestionChangeEvent }
					onKeyDown={ handleInputKeyDownEvent }
					placeholder={ animatedPlaceholder }
					value={ inputValue }
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
			</span>
		),
	} );

	return (
		<form
			className={ classnames( 'vertical-select', {
				'vertical-select--without-value': ! hasValue,
			} ) }
		>
			{ madlib }
			{ hasValue && ( isFocused ? <Arrow /> : '.' ) }
		</form>
	);
};

export default VerticalSelect;
