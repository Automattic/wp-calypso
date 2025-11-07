import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useContainerQuery } from '../../hooks/use-container-query';
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

	const { activeQuery, ref } = useContainerQuery( { small: 0, large: 480 } );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setQuery( localQuery );

		if ( localQuery === '' ) {
			setShowSearchHint( true );
		}
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 2 }>
				<HStack alignment="flex-start" spacing={ 4 } ref={ ref }>
					<DomainSearchControls.Input
						value={ localQuery }
						onChange={ ( value ) => setLocalQuery( value.trim() ) }
						onReset={ () => setLocalQuery( '' ) }
						placeholder={ placeholder }
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
					/>
					{ activeQuery === 'large' && (
						<DomainSearchControls.Submit onClick={ () => onSubmitButtonClick( localQuery ) } />
					) }
				</HStack>
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
