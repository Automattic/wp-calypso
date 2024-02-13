import { useI18n } from '@wordpress/react-i18n';
import { Search } from '../../components/search/search';

interface SearchReposProps {
	value: string;
	onChange?( query: string ): void;
}

export const SearchRepos = ( { value, onChange }: SearchReposProps ) => {
	const { __ } = useI18n();

	return (
		<Search
			query={ value }
			id="repository"
			className="github-deployments-repositories__search"
			placeholder={ __( 'Start typing a repo…' ) }
			options={ [] }
			isSearching={ false }
			onChange={ ( query ) => {
				onChange?.( query.trim() );
			} }
		/>
	);
};
