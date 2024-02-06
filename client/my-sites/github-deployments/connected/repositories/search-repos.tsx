import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { Search } from './search';

interface SearchReposProps {
	siteId: number | null;
	connectionId: number;
	onSelect( repo: string ): void;
	onChange?( query: string ): void;
}

export const SearchRepos = ( { onSelect, onChange }: SearchReposProps ) => {
	const { __ } = useI18n();
	const [ query, setQuery ] = useState( '' );

	return (
		<Search
			query={ query }
			id="repository"
			className="connect-branch__repository-field"
			placeholder={ __( 'Start typing a repo…' ) }
			options={ [] }
			isSearching={ false }
			onSelect={ onSelect }
			onChange={ ( query ) => {
				setQuery( query.trim() );
				onChange?.( query.trim() );
			} }
		/>
	);
};
