import { useTranslate } from 'i18n-calypso';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import LicenseInfo from './license-info';
import PricingSummary from './pricing-summary';
import type { SelectedLicenseProp } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	onClose: () => void;
	selectedLicenses: SelectedLicenseProp[];
	selectedSite?: SiteDetails | null;
	isFormReady: boolean;
	submitForm: ( selectedLicenses: SelectedLicenseProp[] ) => void;
}

export default function ReviewLicenses( {
	onClose,
	selectedLicenses,
	selectedSite,
	isFormReady,
	submitForm,
}: Props ) {
	const translate = useTranslate();

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	return (
		<JetpackLightbox
			className="review-licenses__lightbox"
			isOpen
			onClose={ onClose }
			onAfterOpen={ initMobileSidebar }
		>
			<JetpackLightboxMain ref={ mainRef }>
				<div className="review-licenses__header">
					<div className="review-licenses__title">{ translate( 'Review license selection' ) }</div>
					<div className="review-licenses__subtitle">
						{ translate( 'You’re about to issue the following licenses:' ) }
					</div>
					<div className="review-licenses__selected-licenses">
						{ selectedLicenses.map( ( license ) => (
							<LicenseInfo
								key={ `license-info-${ license.product_id }-${ license.quantity }` }
								product={ license }
								selectedSite={ selectedSite }
							/>
						) ) }
					</div>
				</div>
			</JetpackLightboxMain>

			<JetpackLightboxAside ref={ sidebarRef }>
				<PricingSummary
					selectedLicenses={ selectedLicenses }
					selectedSite={ selectedSite }
					isFormReady={ isFormReady }
					submitForm={ submitForm }
				/>
			</JetpackLightboxAside>
		</JetpackLightbox>
	);
}
