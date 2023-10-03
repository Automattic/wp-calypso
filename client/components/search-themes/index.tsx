import { useTranslate } from 'i18n-calypso';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import './style.scss';

interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
}

const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch } ) => {
	const translate = useTranslate();

	return (
		<div className="search-themes-card" role="presentation" data-tip-target="search-themes-card">
			<Search
				initialValue={ query }
				value={ query }
				placeholder={ translate( 'Search themes…' ) }
				analyticsGroup="Themes"
				searchMode={ SEARCH_MODE_ON_ENTER }
				onSearch={ onSearch }
			/>
		</div>
	);
};

export default SearchThemes;
