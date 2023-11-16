import config from '@automattic/calypso-config';
import { useContext } from 'react';
import { SearchThemes, SearchThemesV2 } from 'calypso/components/search-themes';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';
import { useSelector } from 'calypso/state';
import { prependThemeFilterKeys } from 'calypso/state/themes/selectors';
import './themes-search-bar.scss';

export default () => {
	const { filter, search, setSearch } = useContext( ThemesShowcaseContext );
	const isSearchV2 = config.isEnabled( 'themes/text-search-lots' );
	let query;

	if ( isSearchV2 ) {
		const featureStringFilter = useSelector( ( state ) =>
			prependThemeFilterKeys( state, filter, [ 'subject' ] )
		);
		query = featureStringFilter + search;
	} else {
		query = useSelector( ( state ) => prependThemeFilterKeys( state, filter ) );
	}

	return (
		<div className="theme__search-input">
			{ isSearchV2 ? (
				<SearchThemesV2 query={ query } onSearch={ setSearch } />
			) : (
				<SearchThemes
					query={ query }
					onSearch={ setSearch }
					recordTracksEvent={ () => {} /*this.recordSearchThemesTracksEvent*/ }
				/>
			) }
		</div>
	);
};
