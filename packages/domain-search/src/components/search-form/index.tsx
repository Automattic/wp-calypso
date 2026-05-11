import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
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

export const SearchForm = () => {
	const {
		setQuery,
		events: { onSubmitButtonClick },
	} = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( '' );
	const { placeholder } = useTypedPlaceholder( PLACEHOLDER_PHRASES, false );
	const [ showSearchHint, setShowSearchHint ] = useState( false );
	// Mobile-only layout swap. Below the 'small' viewport breakpoint
	// (600px), the Submit lives *inside* the search input as a compact
	// icon button. At and above 'small', we fall back to the original
	// HStack with the text "Search domains" button alongside.
	const isMobileViewport = useViewportMatch( 'small', '<' );

	// Explicitly focus the input on mount.
	//
	// We previously relied on the underlying <input>'s `autoFocus`
	// attribute, but that fires too early during the stepper's
	// AnimatePresence route transition — the element mounts while
	// the page is still animating in, React calls .focus() before
	// the browser treats the page as the active focus target, and
	// the cursor never lands. useEffect runs after the commit phase
	// and after the transition has settled, so .focus() lands.
	//
	// Note: on iOS Safari this places focus + visible caret but does
	// NOT open the soft keyboard — that's an OS restriction (only a
	// user gesture can open the keyboard). Desktop and most Android
	// browsers behave as expected.
	const inputRef = useRef< HTMLInputElement >( null );
	useEffect( () => {
		inputRef.current?.focus();
	}, [ isMobileViewport ] );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setQuery( localQuery );

		if ( localQuery === '' ) {
			setShowSearchHint( true );
		}
	};

	const inputProps = {
		ref: inputRef,
		value: localQuery,
		onChange: ( value: string ) => setLocalQuery( value.trim() ),
		onReset: () => setLocalQuery( '' ),
		placeholder,
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 2 }>
				{ isMobileViewport ? (
					/* Mobile: wrapper div gives the absolutely-positioned
					   Submit a frame to anchor against. */
					<div className="domain-search__search-form-field">
						<DomainSearchControls.Input { ...inputProps } />
						<DomainSearchControls.Submit
							iconOnly
							onClick={ () => onSubmitButtonClick( localQuery ) }
						/>
					</div>
				) : (
					/* Desktop: original HStack layout with the text Submit
					   sitting alongside the input. Unchanged from trunk. */
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
