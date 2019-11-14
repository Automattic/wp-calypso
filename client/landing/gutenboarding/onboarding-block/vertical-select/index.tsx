/**
 * External dependencies
 */
import React, { createRef, useState, useCallback, FunctionComponent, useEffect } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Suggestions } from '@automattic/components';
import { ENTER } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { SiteVertical, isFilledFormValue } from '../../stores/onboard/types';
import { InjectedStepProps } from '../stepper-wizard';
import Question from '../question';
import { __TodoAny__ } from 'client/types';

/**
 * Style dependencies
 */
import './style.scss';

const VerticalSelect: FunctionComponent< InjectedStepProps > = ( {
	onSelect,
	inputClass,
	isActive,
	onExpand,
} ) => {
	const popular = [
		NO__( 'Travel Agency' ),
		NO__( 'Digital Marketing' ),
		NO__( 'Cameras & Photography' ),
		NO__( 'Website Designer' ),
		NO__( 'Restaurants' ),
		NO__( 'Fashion Designer' ),
		NO__( 'Real Estate Agent' ),
	];

	const [ inputValue, setInputValue ] = useState( '' );
	const [ suggestionsVisibility, setsuggestionsVisibility ] = useState( false );

	/**
	 * Ref to the <Suggestions />, necessary for handling input events
	 *
	 * This ref is effectively `any` and should therefore be considered _dangerous_.
	 *
	 * @TODO: This should be a typed ref to Suggestions, but the component is not typed.
	 * Using `Suggestions` here would effectively be `any`.
	 */
	const suggestionRef = createRef< __TodoAny__ >();

	const verticals = useSelect( select =>
		select( STORE_KEY )
			.getVerticals()
			.map( x => ( {
				label: x.vertical_name,
				id: x.vertical_id,
			} ) )
	);

	const { siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteVertical } = useDispatch( STORE_KEY );

	const showSuggestions = () => setsuggestionsVisibility( true );
	const hideSuggestions = () => setsuggestionsVisibility( false );

	const handleSuggestionChangeEvent = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setInputValue( e.target.value );

	const handleSuggestionKeyDown = ( e: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( suggestionRef.current ) {
			if ( suggestionRef.current.props.suggestions.length && e.keyCode === ENTER ) {
				e.preventDefault();
			}

			suggestionRef.current.handleKeyEvent( e );
		}
	};

	const handleSelect = useCallback(
		( vertical: SiteVertical ) => {
			setSiteVertical( vertical );
			hideSuggestions();
			onSelect();
		},
		[ setSiteVertical, hideSuggestions, onSelect ]
	);

	const value =
		suggestionsVisibility || ! isFilledFormValue( siteVertical ) ? inputValue : siteVertical.label;

	const loadingMessage = [
		{
			label: '',
			category: NO__( 'Loading, please wait…' ),
		},
	];

	const suggestions = ! inputValue.length
		? popular.map( label => ( {
				...verticals.find( vertical => vertical.label.includes( label ) ),
				category: NO__( 'Popular' ),
		  } ) )
		: verticals.filter( x => x.label.toLowerCase().includes( inputValue.toLowerCase() ) );

	const label = NO__( 'My site is about' );
	const displayValue = isFilledFormValue( siteVertical )
		? siteVertical.label
		: NO__( 'enter a topic' );

	// Focus the input when we change to active
	const inputRef = createRef< HTMLInputElement >();
	useEffect( () => {
		if ( isActive ) {
			inputRef.current?.focus();
		}
	}, [ isActive ] );

	return (
		<Question
			label={ label }
			displayValue={ displayValue }
			isActive={ isActive }
			onExpand={ onExpand }
		>
			<div className="vertical-select">
				<input
					ref={ inputRef }
					className={ inputClass }
					placeholder={ NO__( 'enter a topic' ) }
					onChange={ handleSuggestionChangeEvent }
					onFocus={ showSuggestions }
					onBlur={ hideSuggestions }
					onKeyDown={ handleSuggestionKeyDown }
					autoComplete="off"
					value={ value }
				/>
				<Suggestions
					ref={ suggestionRef }
					query={ inputValue }
					suggestions={ ! verticals.length ? loadingMessage : suggestions }
					suggest={ handleSelect }
				/>
			</div>
		</Question>
	);
};

export default VerticalSelect;
