import page from '@automattic/calypso-router';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import useJetpackAgencyDashboardRecordTrackEvent from '../../hooks/use-jetpack-agency-dashboard-record-track-event';
import SitesOverviewContext from '../context';
import DashboardDataContext from '../dashboard-data-context';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from '../lib/constants';

interface Props {
	className?: string;
	label?: string;
	currentLicenseInfo: string | null;
	onClose?: () => void;
	siteId?: number;
	extraAsideContent?: JSX.Element;
	isDisabled?: boolean;
	onCtaClick?: () => void;
	isCTAExternalLink?: boolean;
	ctaHref?: string;
	showPaymentPlan?: boolean;
}

export default function LicenseInfoModal( {
	className,
	label,
	currentLicenseInfo,
	onClose,
	siteId,
	extraAsideContent,
	isDisabled,
	onCtaClick,
	isCTAExternalLink,
	ctaHref,
	showPaymentPlan,
}: Props ) {
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();
	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

	const isA4AEnabled = isA8CForAgencies();
	const { hideLicenseInfo } = useContext( SitesOverviewContext );

	const { products: dashboardProducts } = useContext( DashboardDataContext );
	const { data: A4AProducts } = useProductsQuery();
	const products = isA4AEnabled ? A4AProducts : dashboardProducts;
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, ! isMobile );

	const currentLicenseProductSlug = currentLicenseInfo
		? DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ currentLicenseInfo ]
		: null;

	const currentLicenseProduct = useMemo( () => {
		return currentLicenseProductSlug && products
			? products.find( ( product ) => product.slug === currentLicenseProductSlug )
			: null;
	}, [ currentLicenseProductSlug, products ] );

	const onHideLicenseInfo = () => {
		hideLicenseInfo();
		onClose?.();
	};

	const onIssueLicense = () => {
		if ( ! currentLicenseProductSlug ) {
			return;
		}
		recordEvent( 'issue_license_info', {
			product: currentLicenseProductSlug,
		} );
		onCtaClick?.();
		onHideLicenseInfo();
		if ( isA4AEnabled ) {
			page(
				addQueryArgs(
					{
						product_slug: currentLicenseProductSlug,
						source: 'sitesdashboard',
						site_id: siteId,
					},
					A4A_MARKETPLACE_CHECKOUT_LINK
				)
			);
		} else {
			page(
				addQueryArgs(
					{
						product_slug: currentLicenseProductSlug,
						source: 'dashboard',
						site_id: siteId,
					},
					'/partner-portal/issue-license/'
				)
			);
		}
	};

	return (
		currentLicenseProduct && (
			<LicenseLightbox
				className={ className }
				product={ currentLicenseProduct }
				ctaLabel={ label ?? translate( 'Issue License' ) }
				isCTAExternalLink={ isCTAExternalLink }
				ctaHref={ ctaHref }
				isDisabled={ isA4AEnabled ? false : ! partnerCanIssueLicense || isDisabled } // Noting that in A4A the partnerCanIssueLicense functionality is not yet implemented.
				onActivate={ onIssueLicense }
				onClose={ onHideLicenseInfo }
				extraAsideContent={ extraAsideContent }
				showPaymentPlan={ showPaymentPlan }
			/>
		)
	);
}
