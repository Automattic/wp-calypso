import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import Modal from 'react-modal';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useLicenseProductLightboxData } from './hooks/use-license-product-lightbox-data';
import { CloseIcon } from './icons';
import LicenseLightboxFAQList from './license-lightbox-faq-list';
import LicenseLightboxPaymentPlan from './license-lightbox-payment-plan';
import LicenseLightboxRecommendationTags from './license-lightbox-recommendation-tags';
import LicenseLightboxRegularList from './license-lightbox-regular-list';
import LicenseLightboxSection from './license-lightbox-section';
import './style.scss';

type Props = {
	ctaLabel: string;
	isCTAPrimary?: boolean;
	isDisabled?: boolean;
	onActivate: ( product: APIProductFamilyProduct ) => void;
	onClose: () => void;
	product: APIProductFamilyProduct;
};

const LicenseLightbox: FunctionComponent< Props > = ( {
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
			className="license-lightbox__modal"
			overlayClassName="license-lightbox__modal-overlay"
			isOpen={ true }
			onRequestClose={ onClose }
			htmlOpenClassName="ReactModal__Html--open lightbox-mode"
		>
			<div className="license-lightbox__content-wrapper">
				<Button
					className="license-lightbox__close-button"
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
				<div className="license-lightbox__detail">
					<div className="license-lightbox__detail-header">
						<div className="license-lightbox__product-icon">
							<img alt="" src={ icon } />
						</div>
						<h2>{ title }</h2>
					</div>
					<div className="license-lightbox__detail-desc">{ description }</div>

					{ isLargeScreen && recommendedFor && (
						<LicenseLightboxRecommendationTags tags={ recommendedFor } />
					) }

					{ whatIsIncluded?.length && (
						<LicenseLightboxSection title={ translate( 'Includes' ) }>
							<LicenseLightboxRegularList items={ whatIsIncluded } />
						</LicenseLightboxSection>
					) }

					{ benefits?.length && (
						<LicenseLightboxSection title={ translate( 'Benefits' ) }>
							<LicenseLightboxRegularList items={ benefits } />
						</LicenseLightboxSection>
					) }

					{ faqs?.length && (
						<LicenseLightboxSection title={ translate( 'FAQs' ) }>
							<LicenseLightboxFAQList items={ faqs } />
						</LicenseLightboxSection>
					) }
				</div>

				<div className="license-lightbox__sidebar">
					<LicenseLightboxPaymentPlan product={ product } />

					<Button
						className="license-lightbox__cta-button"
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

export default LicenseLightbox;
