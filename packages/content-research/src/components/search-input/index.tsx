import { Button, SearchControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';

interface SearchInputProps {
	value: string;
	onChange: ( value: string ) => void;
	onSearch: ( topic: string ) => void;
	isLoading: boolean;
}

export default function SearchInput( { value, onChange, onSearch, isLoading }: SearchInputProps ) {
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		inputRef.current?.focus();
	}, [] );

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
				ref={ inputRef }
				__nextHasNoMarginBottom
				value={ value }
				onChange={ onChange }
				placeholder={ __( 'Enter a topic to research…', 'content-research' ) }
			/>
			<Button
				variant="primary"
				icon={ search }
				label={ __( 'Search', 'content-research' ) }
				onClick={ handleSubmit }
				isBusy={ isLoading }
				disabled={ ! value.trim() || isLoading }
			/>
		</form>
	);
}
