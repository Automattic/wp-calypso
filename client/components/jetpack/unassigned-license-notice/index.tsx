import { isEnabled } from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { A4A_UNASSIGNED_LICENSES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
	const dispatch = useDispatch();

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

	const onDismissClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_upsell_unassigned_license_notice_dismiss', {
				feature_type: featureType,
			} )
		);
		setShowUnassignedLicenseNotice( false );
	}, [ dispatch, featureType ] );

	const onActionClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_upsell_unassigned_license_notice_action_click', {
				feature_type: featureType,
			} )
		);
	}, [ dispatch, featureType ] );

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
					onDismissClick={ onDismissClick }
				>
					<NoticeAction
						href={
							isEnabled( 'a8c-for-agencies' )
								? `${ A4A_UNASSIGNED_LICENSES_LINK }`
								: `${ JETPACK_MANAGE_LICENCES_LINK }/unassigned`
						}
						onClick={ onActionClick }
					>
						{ translate( 'View licenses' ) }
					</NoticeAction>
				</Notice>
			) }
		</>
	);
};

export default UnusedLicenseNotice;
