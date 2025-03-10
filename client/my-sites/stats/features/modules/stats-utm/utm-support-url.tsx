import { localizeUrl } from '@automattic/i18n-utils';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { JETPACK_SUPPORT_URL_TRAFFIC, SUPPORT_URL } from '../../../const';

const useUTMSupportURL = ( siteId: number ) => {
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	// TODO: Should it be aligned with getUpsellCopy?
	const supportUrl = isSiteJetpackNotAtomic
		? localizeUrl( `${ JETPACK_SUPPORT_URL_TRAFFIC }#harnessing-utm-stats-for-precision-tracking` )
		: localizeUrl( `${ SUPPORT_URL }#utm` );

	return supportUrl;
};

export default useUTMSupportURL;
