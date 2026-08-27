import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import SearchInput from 'calypso/components/search';
import ReaderMain from 'calypso/reader/components/reader-main';
import SiteSearchResults from './site-search-results';
import StarterPacks from './starter-packs';
import type { JSX } from 'react';

import './style.scss';

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 1024;

export default function ReaderFollowSitesPage(): JSX.Element {
	const translate = useTranslate();
	const [ query, setQuery ] = useState( '' );

	const handleSearch = ( value: string | false ) => {
		setQuery( ( value || '' ).trim().slice( 0, MAX_QUERY_LENGTH ) );
	};

	const isSearching = query.length >= MIN_QUERY_LENGTH;

	/* eslint-disable jsx-a11y/no-autofocus */
	return (
		<ReaderMain className="follow-sites">
			<DocumentHead title={ translate( 'Follow sites' ) } />
			<NavigationHeader
				className="follow-sites__header"
				title={ translate( 'Follow your favorite websites' ) }
				subtitle={ translate( 'Search by name, paste a link, or add an RSS feed.' ) }
			/>
			<div className="follow-sites__content">
				<SearchInput
					additionalClasses="follow-sites__search"
					autoFocus
					delaySearch
					delayTimeout={ 500 }
					hideClose
					placeholder={ translate( 'Try “birding”, “stratechery.com”, or a topic' ) }
					onSearch={ handleSearch }
					disableAutocorrect
				/>
				{ isSearching ? <SiteSearchResults query={ query } /> : <StarterPacks /> }
			</div>
		</ReaderMain>
	);
	/* eslint-enable jsx-a11y/no-autofocus */
}
