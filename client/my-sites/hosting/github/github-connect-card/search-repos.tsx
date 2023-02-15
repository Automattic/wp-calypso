import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Search } from './search';
import { useGithubRepos } from './use-github-repos';

interface SearchReposProps {
	siteId: number | null;
	onSelect( repo: string ): void;
	onReset(): void;
}

export const SearchRepos = ( { siteId, onSelect, onReset }: SearchReposProps ) => {
	const { __ } = useI18n();
	const [ query, setQuery ] = useState( '' );
	const [ debouncedQuery ] = useDebounce( query, 500 );

	const { data: repos } = useGithubRepos( siteId, debouncedQuery );

	return (
		<Search
			query={ query }
			id="repository"
			className="connect-branch__repository-field"
			placeholder={ __( 'Start typing a repo..' ) }
			options={ query ? repos ?? [] : [] }
			onSelect={ onSelect }
			onChange={ ( query ) => setQuery( query.trim() ) }
			onReset={ () => {
				setQuery( '' );
				onReset();
			} }
		/>
	);
};
