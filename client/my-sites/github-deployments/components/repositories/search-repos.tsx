import { useI18n } from '@wordpress/react-i18n';
import { Search } from '../search/search';

interface SearchReposProps {
	value: string;
	disabled?: boolean;
	onChange?( query: string ): void;
}

export const SearchRepos = ( { value, onChange, disabled }: SearchReposProps ) => {
	const { __ } = useI18n();

	return (
		<Search
			query={ value }
			id="repository"
			className="github-deployments-repositories__search"
			placeholder={ __( 'Search repositories' ) }
			options={ [] }
			disabled={ disabled }
			isSearching={ false }
			onChange={ ( query ) => {
				onChange?.( query.trim() );
			} }
		/>
	);
};
