import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const SearchBox = ( { isMobile, doSearch, search } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSearchEvent = ( eventName ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<div className="search-box-header__searchbox">
			<Search
				pinned={ isMobile }
				fitsContainer={ isMobile }
				onSearch={ doSearch }
				initialValue={ search }
				placeholder={ translate( 'Try searching "ecommerce"' ) }
				delaySearch={ true }
				recordEvent={ recordSearchEvent }
			/>
		</div>
	);
};

const PopularSearches = ( props ) => {
	const { searchTerms, siteSlug } = props;
	const translate = useTranslate();

	return (
		<div className="search-box-header__recommended-searches">
			<div className="search-box-header__recommended-searches-title">
				{ translate( 'Most popular searches' ) }
			</div>

			<div className="search-box-header__recommended-searches-list">
				{ searchTerms.map( ( searchTerm ) => (
					<a
						href={ `/plugins/${ siteSlug || '' }?s=${ searchTerm }` }
						className="search-box-header__recommended-searches-list-item"
					>
						{ searchTerm }
					</a>
				) ) }
			</div>
		</div>
	);
};

const SearchHeader = ( props ) => {
	const { doSearch, search, siteSlug, title } = props;

	return (
		<div className="search-box-header">
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox doSearch={ doSearch } search={ search } />
			</div>
			<PopularSearches
				siteSlug={ siteSlug }
				searchTerms={ [ 'shipping', 'seo', 'portfolio', 'chat', 'mailchimp' ] } // hardcoded terms
			/>
		</div>
	);
};

export default SearchHeader;
