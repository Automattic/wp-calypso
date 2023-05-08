import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import Modal from 'react-modal';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useLicenseProductLightboxData } from './hooks/use-license-product-lightbox-data';
import { CloseIcon } from './icons';
import LicenseProductLightboxFAQList from './license-product-lightbox-faq-list';
import LicenseProductLightboxPaymentPlan from './license-product-lightbox-payment-plan';
import LicenseProductLightboxRecommendationTags from './license-product-lightbox-recommendation-tags';
import LicenseProductLightboxRegularList from './license-product-lightbox-regular-list';
import LicenseProductLightboxSection from './license-product-lightbox-section';
import './style.scss';

type Props = {
	ctaLabel: string;
	isCTAPrimary?: boolean;
	isDisabled?: boolean;
	onActivate: ( product: APIProductFamilyProduct ) => void;
	onClose: () => void;
	product: APIProductFamilyProduct;
};

const ProductLightbox: FunctionComponent< Props > = ( {
	ctaLabel,
	isCTAPrimary = true,
	isDisabled,
	onActivate,
	onClose,
	product,
} ) => {
	const translate = useTranslate();
	const isLargeScreen = useBreakpoint( '>782px' );
	const { title, description, icon, recommendedFor, benefits, whatIsIncluded, faqs } =
		useLicenseProductLightboxData( product );

	const onCTAClick = useCallback( () => {
		onActivate( product );
		onClose();
	}, [ product, onActivate, onClose ] );

	return (
		<Modal
			className="license-product-lightbox__modal"
			overlayClassName="license-product-lightbox__modal-overlay"
			isOpen={ true }
			onRequestClose={ onClose }
			htmlOpenClassName="ReactModal__Html--open lightbox-mode"
		>
			<div className="license-product-lightbox__content-wrapper">
				<Button
					className="license-product-lightbox__close-button"
					plain
					onClick={ onClose }
					aria-label={
						translate( 'Close', {
							comment:
								'Text read by screen readers when the close button of the lightbox gets focus.',
						} ) as string
					}
				>
					{ CloseIcon }
				</Button>
				<div className="license-product-lightbox__detail">
					<div className="license-product-lightbox__detail-header">
						<div className="license-product-lightbox__product-icon">
							<img alt="" src={ icon } />
						</div>
						<h2>{ title }</h2>
					</div>
					<div className="license-product-lightbox__detail-desc">{ description }</div>

					{ isLargeScreen && recommendedFor && (
						<LicenseProductLightboxRecommendationTags tags={ recommendedFor } />
					) }

					{ whatIsIncluded?.length && (
						<LicenseProductLightboxSection title={ translate( 'Includes' ) }>
							<LicenseProductLightboxRegularList items={ whatIsIncluded } />
						</LicenseProductLightboxSection>
					) }

					{ benefits?.length && (
						<LicenseProductLightboxSection title={ translate( 'Benefits' ) }>
							<LicenseProductLightboxRegularList items={ benefits } />
						</LicenseProductLightboxSection>
					) }

					{ faqs?.length && (
						<LicenseProductLightboxSection title={ translate( 'FAQs' ) }>
							<LicenseProductLightboxFAQList items={ faqs } />
						</LicenseProductLightboxSection>
					) }
				</div>

				<div className="license-product-lightbox__sidebar">
					<LicenseProductLightboxPaymentPlan product={ product } />

					<Button
						className="license-product-lightbox__cta-button"
						primary={ isCTAPrimary }
						onClick={ onCTAClick }
						disabled={ isDisabled }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ProductLightbox;
