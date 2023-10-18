import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useContext, useMemo } from 'react';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { addQueryArgs } from 'calypso/lib/url';
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
}: Props ) {
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();

	const { hideLicenseInfo } = useContext( SitesOverviewContext );

	const { products } = useContext( DashboardDataContext );
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
	};

	return (
		currentLicenseProduct && (
			<LicenseLightbox
				className={ className }
				product={ currentLicenseProduct }
				ctaLabel={ label ?? translate( 'Issue License' ) }
				isDisabled={ isDisabled }
				onActivate={ onIssueLicense }
				onClose={ onHideLicenseInfo }
				extraAsideContent={ extraAsideContent }
			/>
		)
	);
}
