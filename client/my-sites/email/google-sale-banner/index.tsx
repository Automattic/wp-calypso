import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import { Banner } from 'calypso/components/banner';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

type GoogleSaleBannerProps = {
	domains: Array< ResponseDomain >;
};

const GoogleSaleBanner: FunctionComponent< GoogleSaleBannerProps > = ( { domains } ) => {
	const translate = useTranslate();

	const canCurrentUserPurchaseGSuite = useSelector( canUserPurchaseGSuite );
	const currentRoute = useSelector( getCurrentRoute );
	const googleWorkspaceProduct = useSelector( ( state ) =>
		getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY )
	);

	const domainsEligibleForGoogleWorkspaceSale = domains
		.filter( ( domain ) => {
			if ( domain.expired || domain.isWpcomStagingDomain ) {
				return false;
			}
			if ( ! canCurrentUserAddEmail( domain ) ) {
				return false;
			}
			if ( hasPaidEmailWithUs( domain ) ) {
				return false;
			}
			if ( ! hasGSuiteSupportedDomain( [ domain ] ) ) {
				return false;
			}

			return true;
		} )
		// Push the primary domain to be listed first
		.sort( ( a, b ) => Number( b.isPrimary ?? false ) - Number( a.isPrimary ?? false ) );

	const domainForSale = domainsEligibleForGoogleWorkspaceSale[ 0 ] ?? null;
	const siteForSale = useSelector( ( state ) =>
		domainForSale?.blogId ? getSite( state, domainForSale.blogId ) : getSelectedSite( state )
	);

	if ( ! canCurrentUserPurchaseGSuite ) {
		return null;
	}

	if ( 0 === domainsEligibleForGoogleWorkspaceSale.length ) {
		return null;
	}

	// Verify that we have a percentage discount
	if (
		! hasDiscount( googleWorkspaceProduct ) ||
		( ! googleWorkspaceProduct?.sale_coupon?.discount ?? null )
	) {
		return null;
	}

	return (
		<Banner
			callToAction={ translate( 'Get Google Workspace' ) }
			className="google-sale-banner"
			description={ translate(
				'Set up your custom mailbox @%(domainName)s and enable all the productivity tools Google Workspace offers.',
				{
					args: {
						domainName: domainForSale.name,
					},
					comment:
						'%(domainName)s is a domain name, e.g. example.com; %(price)s is a formatted price, e.g. $3, £2.50',
					components: {
						em: <em />,
					},
				}
			) }
			disableCircle
			iconPath={ googleWorkspaceIcon }
			href={ emailManagementPurchaseNewEmailAccount(
				siteForSale?.slug,
				domainForSale.name,
				currentRoute,
				'google-sale'
			) }
			title={ translate( 'Get %(discount)d% off Google Workspace for a limited time!', {
				args: { discount: googleWorkspaceProduct?.sale_coupon?.discount },
				comment: '%(discount)d is a percentage discount, e.g. 50',
			} ) }
		/>
	);
};

export default GoogleSaleBanner;
