import { useI18n } from '@wordpress/react-i18n';
import { Search } from '../components/search/search';

interface SearchDeploymentsProps {
	value: string;
	onChange?( query: string ): void;
}

export const SearchDeployments = ( { value, onChange }: SearchDeploymentsProps ) => {
	const { __ } = useI18n();

	return (
		<Search
			query={ value }
			id="deployments"
			className="github-deployments__search"
			placeholder={ __( 'Search by repository name…' ) }
			options={ [] }
			isSearching={ false }
			onChange={ ( query ) => {
				onChange?.( query.trim() );
			} }
		/>
	);
};
