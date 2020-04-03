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
import { remove } from 'lodash';

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
	const inputRef = React.useRef< HTMLSpanElement >( document.createElement( 'span' ) );
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
	const showArrow = ! siteTitle && ! siteVertical && inputText.length > 2;

	const animatedPlaceholder = useTyper(
		[
			NO__( 'photography' ),
			NO__( 'blogging' ),
			NO__( 'travel' ),
			NO__( 'marketing' ),
			NO__( 'fashion' ),
			NO__( 'shopping' ),
			NO__( 'design' ),
			NO__( 'real estate' ),
			NO__( 'food' ),
			NO__( 'sports' ),
		],
		isInputEmpty,
		{ delayBetweenWords: 800, delayBetweenCharacters: 110 }
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

		// Does the verticals list include an exact match?
		// If yes, we store it in firstSuggestion (for later use), and remove it from newSuggestions...
		const firstSuggestion = remove(
			newSuggestions,
			suggestion => suggestion.label.toLowerCase() === normalizedInputValue
		)[ 0 ] ?? {
			// ...otherwise, we set firstSuggestion to the user-supplied vertical...
			label: inputValue.trim(),
			id: '', // User-supplied verticals don't have IDs or slugs
			slug: '',
		};

		// ...and finally, we prepend firstSuggestion to our suggestions list.
		newSuggestions.unshift( firstSuggestion );

		// If there is only one suggestion and that suggestion matches the user input value,
		// do not show any suggestions.

		// TODO: write a more advanced compare fn https://github.com/Automattic/wp-calypso/pull/40645#discussion_r402156751
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
	};

	const handleBlur = () => {
		const lastQuery = inputText.trim();
		if ( isFocused && lastQuery.length ) {
			const vertical = suggestions[ 0 ] ?? { label: lastQuery, id: '', slug: '' };
			handleSelect( vertical );
		}
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
			handleBlur();
		}
	};

	React.useEffect( () => {
		if ( isInputEmpty ) {
			inputRef.current.focus();
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect( () => {
		inputRef.current.innerText = siteVertical?.label || '';
	}, [ siteVertical, inputRef ] );

	// translators: Form input for a site's topic where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = NO__( 'My site is about <Input />' );
	// translators: Form input for a site's topic where "<Input />" is replaced with the topic selected by the user.
	const madlibTemplateWithPeriod = NO__( 'My site is about <Input />.' );
	const madlib = __experimentalCreateInterpolateElement(
		siteVertical ? madlibTemplateWithPeriod : madlibTemplate,
		{
			Input: (
				<span className="vertical-select__suggestions-wrapper">
					<span className="vertical-select__input-wrapper">
						{ isInputEmpty && (
							<span className="vertical-select__placeholder">{ animatedPlaceholder }</span>
						) }
						<span
							contentEditable
							tabIndex={ 0 }
							role="textbox"
							aria-multiline="true"
							spellCheck={ false }
							ref={ inputRef }
							/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
							className="madlib__input"
							onKeyDown={ handleInputKeyDownEvent }
							onKeyUp={ handleInputKeyUpEvent }
							onFocus={ () => setIsFocused( true ) }
							onBlur={ handleBlur }
						/>
					</span>
					{ /* us visibility to keep the layout fixed with and without the arrow */ }
					{ showArrow && <Arrow className="vertical-select__arrow" /> }
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
		}
	);

	return (
		<form
			className={ classnames( 'vertical-select', {
				'vertical-select--without-value': isInputEmpty,
			} ) }
		>
			{ madlib }
		</form>
	);
};

export default VerticalSelect;
