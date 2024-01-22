import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Search } from './search';
import { useGithubReposQuery } from './use-github-repos-query';

interface SearchReposProps {
	siteId: number | null;
	connectionId: number;
	onSelect( repo: string, branch ): void;
	onChange?( query: string ): void;
}

export const SearchRepos = ( { siteId, connectionId, onSelect, onChange }: SearchReposProps ) => {
	const { __ } = useI18n();
	const [ query, setQuery ] = useState( '' );
	const [ debouncedQuery ] = useDebounce( query, 500 );
	const { data: repos, isLoading } = useGithubReposQuery( siteId, debouncedQuery, connectionId );
	const repoNames = repos ? Object.keys( repos ) : [];

	return (
		<Search
			query={ query }
			id="repository"
			className="connect-branch__repository-field"
			placeholder={ __( 'Start typing a repo…' ) }
			options={ query ? repoNames ?? [] : [] }
			isSearching={ isLoading }
			onSelect={ ( value ) => onSelect( value, repos[ value ] ) }
			onChange={ ( query ) => {
				setQuery( query.trim() );
				onChange?.( query.trim() );
			} }
		/>
	);
};
