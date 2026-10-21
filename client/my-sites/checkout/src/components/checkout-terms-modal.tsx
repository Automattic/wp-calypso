import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import CheckoutTerms from './checkout-terms';
import type { ResponseCart } from '@automattic/shopping-cart';

const TermsModalBody = styled.div`
	font-size: 14px;
	line-height: 1.5;
	color: ${ ( props ) => props.theme.colors.textColor };

	& > .checkout__terms {
		margin-block-end: 16px;
	}

	& > * {
		margin-block: 12px;
	}

	a {
		text-decoration: underline;
	}

	/*
	 * The inline terms keep a FoldableCard for a few edge-case notices
	 * (bundled-domain, international fee, Jetpack social disclaimer).
	 * Inside the modal there's no reason to collapse them — show them inline.
	 */
	.checkout__terms-foldable-card {
		box-shadow: none;
		padding: 0;

		.foldable-card__header {
			display: none;
		}

		.foldable-card__content {
			display: block !important;
			padding: 0;
			border-top: none;
		}
	}
`;

export default function CheckoutTermsModal( {
	cart,
	isOpen,
	onClose,
}: {
	cart: ResponseCart;
	isOpen: boolean;
	onClose: () => void;
} ) {
	const translate = useTranslate();

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ translate( 'Terms and conditions', { textOnly: true } ) }
			onRequestClose={ onClose }
			size="medium"
			className="checkout-terms-modal"
		>
			<TermsModalBody>
				<CheckoutTerms cart={ cart } expandReadMore />
			</TermsModalBody>
		</Modal>
	);
}
