import { __experimentalHStack as HStack } from '@wordpress/components';
import { useState } from 'react';
import { useTypedPlaceholder } from '../../hooks/use-typed-placeholder';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const PLACEHOLDER_PHRASES = [
	'dailywine.blog',
	'creatortools.shop',
	'literatiagency.com',
	'democratizework.org',
	'discardedobject.art',
];

export const SearchForm = () => {
	const { setQuery } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( '' );
	const { placeholder } = useTypedPlaceholder( PLACEHOLDER_PHRASES, false );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setQuery( localQuery );
	};

	return (
		<form onSubmit={ handleSubmit }>
			{ ' ' }
			<HStack alignment="flex-start" spacing={ 4 }>
				<DomainSearchControls.Input
					value={ localQuery }
					onChange={ ( value ) => setLocalQuery( value.trim() ) }
					onReset={ () => setLocalQuery( '' ) }
					placeholder={ placeholder }
				/>
				<DomainSearchControls.Submit />
			</HStack>
		</form>
	);
};
