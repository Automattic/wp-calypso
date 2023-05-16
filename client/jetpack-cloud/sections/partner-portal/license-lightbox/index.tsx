import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { FunctionComponent, useCallback } from 'react';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
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
};

const LicenseLightbox: FunctionComponent< LicenseLightBoxProps > = ( {
	ctaLabel,
	isCTAPrimary = true,
	isDisabled,
	onActivate,
	onClose,
	product,
} ) => {
	const isLargeScreen = useBreakpoint( '>782px' );
	const { title, product: productInfo } = useLicenseLightboxData( product );

	const onCTAClick = useCallback( () => {
		onActivate( product );
		onClose();
	}, [ product, onActivate, onClose ] );

	return (
		<JetpackLightbox className="license-lightbox" isOpen={ true } onClose={ onClose }>
			<JetpackLightboxMain>
				{ productInfo && (
					<JetpackProductInfo title={ title } product={ productInfo } full={ isLargeScreen } />
				) }
			</JetpackLightboxMain>

			<JetpackLightboxAside>
				<LicenseLightboxPaymentPlan product={ product } />

				<Button
					className="license-lightbox__cta-button"
					primary={ isCTAPrimary }
					onClick={ onCTAClick }
					disabled={ isDisabled }
				>
					{ ctaLabel }
				</Button>
			</JetpackLightboxAside>
		</JetpackLightbox>
	);
};

export default LicenseLightbox;
