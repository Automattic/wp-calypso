import { useTranslate } from 'i18n-calypso';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import PaymentMethodAdd from 'calypso/jetpack-cloud/sections/partner-portal/primary/payment-method-add';
import LicenseInfo from './license-info';
import PricingSummary from './pricing-summary';
import type { SelectedLicenseProp } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	isMultiSiteSelect?: boolean;
	onClose: () => void;
	selectedLicenses: SelectedLicenseProp[];
	selectedSite?: SiteDetails | null;
	showAddCard?: boolean;
	handleGoBack?: ( issueLicense?: boolean ) => void;
	handleIssueLicense?: () => void;
	isLoading?: boolean;
}

export default function ReviewLicenses( {
	isMultiSiteSelect = false,
	onClose,
	selectedLicenses,
	selectedSite,
	showAddCard,
	handleGoBack,
	handleIssueLicense,
	isLoading,
}: Props ) {
	const translate = useTranslate();

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	return (
		<JetpackLightbox
			className="review-licenses__lightbox"
			isOpen={ true }
			onClose={ onClose }
			onAfterOpen={ initMobileSidebar }
		>
			{ showAddCard ? (
				<PaymentMethodAdd goBack={ handleGoBack } isModalView />
			) : (
				<>
					<JetpackLightboxMain ref={ mainRef }>
						<div className="review-licenses__header">
							<div className="review-licenses__title">
								{ translate( 'Review license selection' ) }
							</div>
							<div className="review-licenses__subtitle">
								{ translate( 'You’re about to issue the following licenses:' ) }
							</div>
							<div className="review-licenses__selected-licenses">
								{ selectedLicenses.map( ( license ) => (
									<LicenseInfo
										key={ `license-info-${ license.product_id }-${ license.quantity }` }
										product={ license }
										selectedSite={ selectedSite }
										isMultiSiteSelect={ isMultiSiteSelect }
									/>
								) ) }
							</div>
						</div>
					</JetpackLightboxMain>

					<JetpackLightboxAside ref={ sidebarRef }>
						<PricingSummary
							selectedLicenses={ selectedLicenses }
							selectedSite={ selectedSite }
							handleIssueLicense={ handleIssueLicense }
							isLoading={ isLoading }
						/>
					</JetpackLightboxAside>
				</>
			) }
		</JetpackLightbox>
	);
}
