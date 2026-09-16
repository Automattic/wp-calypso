import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDebounce, useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useTypedPlaceholder } from '../../hooks/use-typed-placeholder';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

import './style.scss';

const PLACEHOLDER_PHRASES = [
	'dailywine.blog',
	'creatortools.shop',
	'literatiagency.com',
	'democratizework.org',
	'discardedobject.art',
];

const INSTANT_SEARCH_DEBOUNCE_MS = 300;

export const SearchForm = () => {
	const {
		query,
		setQuery,
		config,
		events: { onSubmitButtonClick },
	} = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	// Name Pulse searches as you type; every other mode is submit-only.
	const isInstantSearch = config.showNamePulseSearch;
	const debouncedSetQuery = useDebounce( setQuery, INSTANT_SEARCH_DEBOUNCE_MS );
	const { placeholder } = useTypedPlaceholder( PLACEHOLDER_PHRASES, false );
	const [ showSearchHint, setShowSearchHint ] = useState( false );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	// autoFocus races the stepper's route-transition animation; focus
	// in an effect lands reliably after the commit phase.
	const inputRef = useRef< HTMLInputElement >( null );
	useEffect( () => {
		const input = inputRef.current;
		input?.focus();
		input?.setSelectionRange( input.value.length, input.value.length );
	}, [] );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		debouncedSetQuery.cancel();
		setQuery( localQuery );

		if ( localQuery === '' ) {
			setShowSearchHint( true );
		}
	};

	const inputProps = {
		ref: inputRef,
		value: localQuery,
		onChange: ( value: string ) => {
			if ( ! isInstantSearch ) {
				setLocalQuery( value.trim() );
				return;
			}

			// Keep the raw value so a trailing space can start the next word.
			setLocalQuery( value );
			if ( value.trim() ) {
				debouncedSetQuery( value.trim() );
			} else {
				debouncedSetQuery.cancel();
			}
		},
		onReset: () => setLocalQuery( '' ),
		placeholder,
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 2 }>
				{ isMobileViewport ? (
					<div className="domain-search__search-form-field">
						<DomainSearchControls.Input { ...inputProps } />
						<DomainSearchControls.Submit
							iconOnly
							onClick={ () => onSubmitButtonClick( localQuery ) }
						/>
					</div>
				) : (
					<HStack alignment="flex-start" spacing={ 4 }>
						<DomainSearchControls.Input { ...inputProps } />
						<DomainSearchControls.Submit onClick={ () => onSubmitButtonClick( localQuery ) } />
					</HStack>
				) }
				{ showSearchHint && (
					<Text variant="muted">
						{ createInterpolateElement(
							__(
								'Try searching for a word like <studioLink>studio</studioLink> or <coffeeLink>coffee</coffeeLink> to get started.'
							),
							{
								studioLink: (
									<Button
										variant="link"
										onClick={ () => setQuery( 'studio' ) }
										className="domain-search__search-form-hint"
									/>
								),
								coffeeLink: (
									<Button
										variant="link"
										onClick={ () => setQuery( 'coffee' ) }
										className="domain-search__search-form-hint"
									/>
								),
							}
						) }
					</Text>
				) }
			</VStack>
		</form>
	);
};
