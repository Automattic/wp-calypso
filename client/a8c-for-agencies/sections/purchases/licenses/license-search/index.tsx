import page from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import Search from 'calypso/components/search';
import UrlSearch from 'calypso/lib/url-search';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicenseListContext from '../licenses-overview/context';

interface Props {
	doSearch: ( query: string ) => void; // prop coming from UrlSearch
}

const LicenseSearch = ( { doSearch }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { search } = useContext( LicenseListContext );

	const onSearch = ( query: string ) => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_search', { query } ) );
		page( removeQueryArgs( window.location.pathname, 'page' ) ); // remove page query param before searching
		doSearch( query );
	};

	return (
		<Search
			pinned
			hideFocus
			isOpen
			initialValue={ search }
			hideClose={ ! search }
			onSearch={ onSearch }
			placeholder={ translate( 'Search by product name or license code' ) }
			delaySearch
		/>
	);
};

export default UrlSearch( LicenseSearch );
