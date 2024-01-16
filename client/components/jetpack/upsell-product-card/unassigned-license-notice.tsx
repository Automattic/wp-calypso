import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { productHasFeatureType } from 'calypso/blocks/jetpack-benefits/feature-checks';
import QueryJetpackPartnerPortalLicenses from 'calypso/components/data/query-jetpack-partner-portal-licenses';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { getProductSlugFromLicenseKey } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductInfo from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-info';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { JETPACK_MANAGE_LICENCES_LINK } from 'calypso/jetpack-cloud/sections/sidebar-navigation/lib/constants';
import { getPaginatedLicenses } from 'calypso/state/partner-portal/licenses/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';

interface UnusedLicenseNoticeProps {
	featureType: string;
}

/**
 * This shows a notice if we detect a detached license that grants access to the feature in question.
 *
 * Caveat: we only check the first 50 detached licenses (page one via the API), and only for the currently-selected key.
 */
const UnusedLicenseNotice = ( { featureType }: UnusedLicenseNoticeProps ) => {
	const [ showExistingLicenseNotice, setShowUnassignedLicenseNotice ] = useState( false );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const checkLicenseKeyForFeature = useCallback(
		( licenseKey: string ) => {
			// Truncate unneeded data (e.g. 'jetpack-backup-t1')
			const licenseProductSlug = getProductSlugFromLicenseKey( licenseKey );

			if ( ! licenseProductSlug ) {
				return false;
			}

			// Convert to a monthly product slug (e.g. 'jetpack_backup_t1_monthly')
			const monthlyProduct = getProductInfo( licenseProductSlug );

			if ( ! monthlyProduct ) {
				return false;
			}

			// Verify product has feature
			const hasFeature = productHasFeatureType( monthlyProduct.productSlug, featureType );
			return hasFeature;
		},
		[ featureType ]
	);

	const licenses = useSelector( getPaginatedLicenses );

	useEffect( () => {
		if ( ! licenses?.items ) {
			return;
		}
		for ( const l in licenses.items ) {
			const hasFeature = checkLicenseKeyForFeature( licenses.items[ l ].licenseKey );
			if ( hasFeature ) {
				setShowUnassignedLicenseNotice( true );
				break;
			}
		}
	}, [ checkLicenseKeyForFeature, licenses ] );

	return (
		<>
			{ isPartnerOAuthTokenLoaded && (
				<QueryJetpackPartnerPortalLicenses
					filter={ LicenseFilter.Detached }
					search=""
					sortField={ LicenseSortField.IssuedAt }
					sortDirection={ LicenseSortDirection.Descending }
					page={ 1 }
				/>
			) }
			{ showExistingLicenseNotice && (
				<Notice
					status="is-warning"
					text={ translate(
						'You have unassigned licenses that would give your site access to this feature.'
					) }
					onDismissClick={ () => setShowUnassignedLicenseNotice( false ) }
				>
					<NoticeAction href={ JETPACK_MANAGE_LICENCES_LINK + '/unassigned' }>
						{ translate( 'View licenses' ) }
					</NoticeAction>
				</Notice>
			) }
		</>
	);
};

export default UnusedLicenseNotice;
