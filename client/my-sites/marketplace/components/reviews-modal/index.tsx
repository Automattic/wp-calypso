import { Dialog } from '@automattic/components';
import { ProductProps } from 'calypso/data/marketplace/use-marketplace-reviews';

import './styles.scss';

type Props = {
	isVisible: boolean;
	onClose: () => void;
	productName: string;
} & ProductProps;

export const ReviewsModal = ( props: Props ) => {
	const { isVisible, onClose, productName } = props;

	return (
		<Dialog
			className="marketplace-reviews-modal"
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon
		>
			<div className="marketplace-reviews-modal-header">
				<div className="marketplace-reviews-modal-title">{ productName }</div>
			</div>
		</Dialog>
	);
};
