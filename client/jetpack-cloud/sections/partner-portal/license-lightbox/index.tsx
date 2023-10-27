import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { FunctionComponent, useCallback } from 'react';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import JetpackProductInfo from 'calypso/components/jetpack/jetpack-product-info';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useLicenseLightboxData } from './hooks/use-license-lightbox-data';
import LicenseLightboxPaymentPlan from './license-lightbox-payment-plan';

import './style.scss';

export type LicenseLightBoxProps = {
	ctaLabel: string;
	isCTAPrimary?: boolean;
	isDisabled?: boolean;
	onActivate: ( product: APIProductFamilyProduct ) => void;
	onClose: () => void;
	product: APIProductFamilyProduct;
	extraAsideContent?: JSX.Element;
	className?: string;
};

const LicenseLightbox: FunctionComponent< LicenseLightBoxProps > = ( {
	ctaLabel,
	isCTAPrimary = true,
	isDisabled,
	onActivate,
	onClose,
	product,
	extraAsideContent,
	className,
} ) => {
	const isLargeScreen = useBreakpoint( '>782px' );
	const { title, product: productInfo } = useLicenseLightboxData( product );

	const onCTAClick = useCallback( () => {
		onActivate( product );
		onClose();
	}, [ product, onActivate, onClose ] );

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	return (
		<JetpackLightbox
			className={ classNames( 'license-lightbox', className ) }
			isOpen={ true }
			onClose={ onClose }
			onAfterOpen={ initMobileSidebar }
		>
			<JetpackLightboxMain ref={ mainRef }>
				{ productInfo && (
					<JetpackProductInfo title={ title } product={ productInfo } full={ isLargeScreen } />
				) }
			</JetpackLightboxMain>

			<JetpackLightboxAside ref={ sidebarRef }>
				<LicenseLightboxPaymentPlan product={ product } />

				<Button
					className="license-lightbox__cta-button"
					primary={ isCTAPrimary }
					onClick={ onCTAClick }
					disabled={ isDisabled }
				>
					{ ctaLabel }
				</Button>
				{ extraAsideContent }
			</JetpackLightboxAside>
		</JetpackLightbox>
	);
};

export default LicenseLightbox;
