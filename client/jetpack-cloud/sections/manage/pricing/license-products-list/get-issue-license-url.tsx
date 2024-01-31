import { addQueryArgs } from '@wordpress/url';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';

const GetIssueLicenseURL = ( variantSlug: string, bundleSize: number | undefined ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );
	if ( isLoggedIn && ! isAgency ) {
		return addQueryArgs( `/manage/signup/`, {
			product_slug: variantSlug,
			source: 'manage-pricing-page',
			bundle_size: bundleSize,
		} );
	}
	return addQueryArgs( `/partner-portal/issue-license/`, {
		product_slug: variantSlug,
		source: 'manage-pricing-page',
		bundle_size: bundleSize,
	} );
};

export default GetIssueLicenseURL;
