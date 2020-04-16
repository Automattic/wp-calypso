/**
 * External dependencies
 */
import React from 'react';
import { remove } from 'lodash';
import classnames from 'classnames';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { ENTER, TAB } from '@wordpress/keycodes';
import { useViewportMatch } from '@wordpress/compose';
import { Suggestions } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';

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
	onNext: () => void;
}

const VerticalSelect: React.FunctionComponent< Props > = ( { onNext } ) => {
	const { __ } = useI18n();
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
	const isMobile = useViewportMatch( 'small', '<' );

	const inputText = inputRef.current.innerText || '';
	const isInputEmpty = ! inputText.length;
	const showArrow = ( ( ! siteTitle && ! siteVertical ) || isMobile ) && inputText.length > 2;

	const animatedPlaceholder = useTyper(
		[
			/* translators: Input placeholder content, e.g. "My site is about [[ photography ]]" */
			__( 'photography' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ blogging ]]" */
			__( 'blogging' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ travel ]]" */
			__( 'travel' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ marketing ]]" */
			__( 'marketing' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ fashion ]]" */
			__( 'fashion' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ shopping ]]" */
			__( 'shopping' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ design ]]" */
			__( 'design' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ real estate ]]" */
			__( 'real estate' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ food ]]" */
			__( 'food' ),
			/* translators: Input placeholder content, e.g. "My site is about [[ sports ]]" */
			__( 'sports' ),
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

		// TODO: write a more advanced compare fn https://github.com/Automattic/wp-calypso/pull/40645#discussion_r402156751
		const newSuggestions = verticals.filter( vertical =>
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

		setSuggestions( newSuggestions );
	};

	const handleSelect = ( vertical: SiteVertical ) => {
		setSiteVertical( vertical );
		setIsFocused( false ); // prevent executing handleBlur()
		// empty suggestions cache once a vertical is selceted
		setSuggestions( [] );
	};

	const handleBlur = () => {
		const lastQuery = inputText.trim();
		if ( isFocused && lastQuery.length ) {
			const vertical = suggestions[ 0 ] ?? { label: lastQuery, id: '', slug: '' };
			handleSelect( vertical );
		}
	};

	const handleArrowClick = () => {
		handleBlur();
		onNext();
	};

	const handleSuggestAction = ( vertical: SiteVertical ) => {
		handleSelect( vertical );
		onNext();
	};

	const handleInputKeyUpEvent = ( e: React.KeyboardEvent< HTMLSpanElement > ) => {
		const input = e.currentTarget.innerText.trim();
		if ( ! input.length ) {
			resetSiteVertical();
		}
		updateSuggestions( input );
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
	const madlibTemplate = __( 'My site is about <Input />' );
	// translators: Form input for a site's topic where "<Input />" is replaced with the topic selected by the user.
	const madlibTemplateWithPeriod = __( 'My site is about <Input />.' );
	const madlib = createInterpolateElement(
		siteVertical && ! isMobile ? madlibTemplateWithPeriod : madlibTemplate,
		{
			Input: (
				<span className="vertical-select__suggestions-wrapper">
					<span className="vertical-select__input-wrapper">
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
						<span className="vertical-select__placeholder">{ animatedPlaceholder }</span>
						{ showArrow && (
							<Arrow className="vertical-select__arrow" onClick={ handleArrowClick } />
						) }
					</span>
					<div className="vertical-select__suggestions">
						{ !! verticals.length && (
							<Suggestions
								ref={ suggestionRef }
								query={ inputText }
								suggestions={ suggestions }
								suggest={ handleSuggestAction }
								title={ __( 'Suggestions' ) }
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
				'vertical-select--with-suggestions': !! suggestions.length && isMobile,
			} ) }
		>
			{ madlib }
		</form>
	);
};

export default VerticalSelect;
