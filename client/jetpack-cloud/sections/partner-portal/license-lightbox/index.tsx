import { Button, Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { FunctionComponent, ReactNode, useCallback } from 'react';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxFooter,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import { VendorInfo } from 'calypso/components/jetpack/jetpack-lightbox/types';
import JetpackProductInfo from 'calypso/components/jetpack/jetpack-product-info';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useLicenseLightboxData } from './hooks/use-license-lightbox-data';
import LicenseLightboxJetpackManageLicense from './license-lightbox-jetpack-manage-license';

import './style.scss';

export type LicenseLightBoxProps = {
	ctaLabel: string;
	isCTAPrimary?: boolean;
	isDisabled?: boolean;
	onActivate: ( product: APIProductFamilyProduct ) => void;
	onClose: () => void;
	product: APIProductFamilyProduct;
	extraAsideContent?: JSX.Element;
	secondaryAsideContent?: JSX.Element;
	className?: string;
	quantity?: number;
	isCTAExternalLink?: boolean;
	ctaHref?: string;
	showPaymentPlan?: boolean;
	fireCloseOnCTAClick?: boolean;
	customDescription?: ReactNode;
	customFooter?: ReactNode;
	vendor?: VendorInfo | null;
};

const LicenseLightbox: FunctionComponent< LicenseLightBoxProps > = ( {
	ctaLabel,
	isCTAPrimary = true,
	isCTAExternalLink = false,
	ctaHref,
	isDisabled,
	onActivate,
	onClose,
	product,
	extraAsideContent,
	secondaryAsideContent,
	className,
	quantity,
	showPaymentPlan = true,
	fireCloseOnCTAClick = true,
	customDescription,
	customFooter,
	vendor,
} ) => {
	const isLargeScreen = useBreakpoint( '>782px' );
	const { title, product: productInfo } = useLicenseLightboxData( product );

	const onCTAClick = useCallback( () => {
		onActivate( product );
		if ( fireCloseOnCTAClick ) {
			onClose();
		}
	}, [ product, onActivate, onClose, fireCloseOnCTAClick ] );

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	return (
		<JetpackLightbox
			className={ clsx( 'license-lightbox', className ) }
			isOpen
			onClose={ onClose }
			onAfterOpen={ initMobileSidebar }
		>
			<JetpackLightboxMain ref={ mainRef }>
				{ productInfo && (
					<JetpackProductInfo
						vendor={ vendor }
						title={ title }
						product={ productInfo }
						full={ isLargeScreen }
						customDescription={ customDescription }
					/>
				) }

				{ customFooter && <JetpackLightboxFooter>{ customFooter }</JetpackLightboxFooter> }
			</JetpackLightboxMain>

			<JetpackLightboxAside ref={ sidebarRef }>
				{ showPaymentPlan && (
					<LicenseLightboxJetpackManageLicense product={ product } quantity={ quantity } />
				) }

				<Button
					className="license-lightbox__cta-button"
					primary={ isCTAPrimary }
					onClick={ ! isCTAExternalLink ? onCTAClick : undefined }
					disabled={ isDisabled }
					href={ ctaHref }
					target={ isCTAExternalLink ? '_blank' : undefined }
				>
					{ ctaLabel }
					{ isCTAExternalLink && (
						<Gridicon className="license-lightbox__cta-button-external-link" icon="external" />
					) }
				</Button>
				{ extraAsideContent }
				{ secondaryAsideContent && (
					<>
						<div className="license-lightbox__separator">Or</div>
					</>
				) }
				{ secondaryAsideContent }
			</JetpackLightboxAside>
		</JetpackLightbox>
	);
};

export default LicenseLightbox;
