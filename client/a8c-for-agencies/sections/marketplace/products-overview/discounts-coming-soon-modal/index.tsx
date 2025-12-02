import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

type Props = {
	onClose: () => void;
};

export default function DiscountsComingSoonModal( { onClose }: Props ) {
	const translate = useTranslate();

	return (
		<Modal
			className="discounts-coming-soon-modal"
			title={ translate( 'Discounts coming soon' ) }
			onRequestClose={ onClose }
		>
			<p>
				{ translate(
					"We're working on a new tier-based discount model that rewards you as you grow with Automattic for Agencies. We'll notify you when it's ready."
				) }
			</p>
		</Modal>
	);
}
