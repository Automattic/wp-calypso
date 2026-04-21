import { Button, SearchControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';

interface SearchInputProps {
	onSearch: ( topic: string ) => void;
	isLoading: boolean;
}

export default function SearchInput( { onSearch, isLoading }: SearchInputProps ) {
	const [ value, setValue ] = useState( '' );

	const handleSubmit = ( event?: React.FormEvent ) => {
		event?.preventDefault();
		const trimmed = value.trim();
		if ( trimmed ) {
			onSearch( trimmed );
		}
	};

	return (
		<form className="content-research-search-input" onSubmit={ handleSubmit }>
			<SearchControl
				__nextHasNoMarginBottom
				value={ value }
				onChange={ setValue }
				placeholder={ __( 'Enter a topic to research…', 'content-research' ) }
				onKeyDown={ ( event: React.KeyboardEvent ) => {
					if ( event.key === 'Enter' ) {
						handleSubmit();
					}
				} }
			/>
			<Button
				variant="primary"
				icon={ search }
				onClick={ handleSubmit }
				isBusy={ isLoading }
				disabled={ ! value.trim() || isLoading }
			>
				{ __( 'Search', 'content-research' ) }
			</Button>
		</form>
	);
}
