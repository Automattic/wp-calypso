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
	const isMobileViewport = useViewportMatch( 'small', '<' );
	// Enter in the input triggers the form's implicit submission; the keydown is
	// the only reliable way to tell it apart from a button click.
	const submittedWithEnter = useRef( false );

	// autoFocus races the stepper's route-transition animation; focus
	// in an effect lands reliably after the commit phase.
	const inputRef = useRef< HTMLInputElement >( null );
	useEffect( () => {
		inputRef.current?.focus();
	}, [] );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const submitMethod = submittedWithEnter.current ? 'enter' : 'button';
		submittedWithEnter.current = false;

		onSubmitButtonClick( localQuery, submitMethod );
		setQuery( localQuery, submitMethod === 'enter' ? 'submit_enter' : 'submit_button' );

		if ( localQuery === '' ) {
			setShowSearchHint( true );
		}
	};

	const inputProps = {
		ref: inputRef,
		value: localQuery,
		onChange: ( value: string ) => setLocalQuery( value.trim() ),
		onReset: () => setLocalQuery( '' ),
		onKeyDown: ( event: React.KeyboardEvent< HTMLInputElement > ) => {
			submittedWithEnter.current = event.key === 'Enter';
		},
		placeholder,
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 2 }>
				{ isMobileViewport ? (
					<div className="domain-search__search-form-field">
						<DomainSearchControls.Input { ...inputProps } />
						<DomainSearchControls.Submit iconOnly />
					</div>
				) : (
					<HStack alignment="flex-start" spacing={ 4 }>
						<DomainSearchControls.Input { ...inputProps } />
						<DomainSearchControls.Submit />
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
										onClick={ () => setQuery( 'studio', 'hint_link' ) }
										className="domain-search__search-form-hint"
									/>
								),
								coffeeLink: (
									<Button
										variant="link"
										onClick={ () => setQuery( 'coffee', 'hint_link' ) }
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
