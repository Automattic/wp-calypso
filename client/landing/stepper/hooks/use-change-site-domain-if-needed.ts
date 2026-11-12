import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import { useDispatch } from 'calypso/state';
import { requestSiteAddressChange } from 'calypso/state/site-address-change/actions';
import { useSiteData } from './use-site-data';

const FREE_DOMAIN_SUFFIX = '.wordpress.com';

const useChangeSiteDomainIfNeeded = () => {
	const dispatch = useDispatch();
	const { siteId, siteSlug } = useSiteData();

	const changeSiteDomainIfNeeded = async ( domain: string ) => {
		if ( ! siteSlug || domain === siteSlug || ! domain.endsWith( FREE_DOMAIN_SUFFIX ) ) {
			return;
		}

		await dispatch(
			requestSiteAddressChange(
				siteId,
				domain.replace( FREE_DOMAIN_SUFFIX, '' ),
				'wordpress.com',
				siteSlug,
				freeSiteAddressType.BLOG,
				true,
				false,
				true
			)
		);
	};

	return changeSiteDomainIfNeeded;
};

export default useChangeSiteDomainIfNeeded;
