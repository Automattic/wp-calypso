/**
 * External dependencies
 */
import React, { useState, useCallback, useRef } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Suggestions } from '@automattic/components';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { SiteVertical, isFilledFormValue } from '../../stores/onboard/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	inputClass: string;
}

export default function VerticalSelect( { inputClass, forceHideSuggestions, onClick }: Props ) {
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

	const suggestionRef = useRef< Suggestions >( null );
	const inputRef = useRef< HTMLInputElement >( null );

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

	const handleSuggestionChangeEvent = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setInputValue( e.target.value as string ),
		[ setInputValue ]
	);

	const handleSuggestionKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( suggestionRef && suggestionRef.current ) {
				if ( suggestionRef.current.props.suggestions.length > 0 && e.key === 'Enter' ) {
					e.preventDefault();
				}

				suggestionRef.current.handleKeyEvent( e );
			}
		},
		[ setInputValue ]
	);

	const handleSelect = useCallback(
		( vertical: SiteVertical ) => {
			setSiteVertical( vertical );
			hideSuggestions();
			if ( inputRef && inputRef.current ) {
				inputRef.current.blur();
			}
		},
		[ setSiteVertical, hideSuggestions ]
	);

	const value =
		suggestionsVisibility || ! isFilledFormValue( siteVertical ) ? inputValue : siteVertical.label;

	const loadingMessage = [
		{
			label: '',
			category: NO__( 'Loading, please wait...' ),
		},
	];

	const suggestions = ! inputValue.length
		? popular.map( label => ( {
				...verticals.find( vertical => vertical.label.includes( label ) ),
				category: NO__( 'Popular' ),
		  } ) )
		: verticals.filter( x => x.label.toLowerCase().includes( inputValue.toLowerCase() ) );

	return (
		<div className="vertical-select">
			{ suggestionsVisibility || ! value ? (
				<>
					<input
						ref={ inputRef }
						className={ inputClass }
						placeholder={ NO__( 'enter a topic' ) }
						onChange={ handleSuggestionChangeEvent }
						onFocus={ showSuggestions }
						onBlur={ hideSuggestions }
						onKeyDown={ handleSuggestionKeyDown }
						onMouseDown={ onClick }
						autoComplete="off"
						value={ value }
					/>
					{ ! forceHideSuggestions && (
						<Suggestions
							ref={ suggestionRef }
							query={ inputValue }
							suggestions={ ! verticals.length ? loadingMessage : suggestions }
							suggest={ handleSelect }
						/>
					) }
				</>
			) : (
				<span
					ref={ inputRef }
					className={ inputClass }
					onClick={ showSuggestions }
					onMouseDown={ onClick }
					onFocus={ onClick }
					onKeyDown={ onClick }
					onKeyPress={ showSuggestions }
					autoComplete="off"
					role="button"
					tabIndex="0"
				>
					{ value ? value : NO__( 'enter a topic' ) }
				</span>
			) }
		</div>
	);
}
