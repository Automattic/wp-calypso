import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

type PointToWpcomDialogProps = {
	visible: boolean;
	onClose: () => void;
};

export const PointToWpcomDialog = ( { visible, onClose }: PointToWpcomDialogProps ) => {
	const { __ } = useI18n();

	const handleClick = () => {
		onClose();
	};

	const renderButtons = () => {
		return [
			{
				action: 'cancel',
				label: __( 'Cancel' ),
				onClick: onClose,
			},
			{
				action: 'submit',
				label: __( 'Confirm' ),
				isPrimary: true,
				onClick: handleClick,
			},
		];
	};
	return (
		<Dialog isVisible={ visible } onClose={ onClose } buttons={ renderButtons() }>
			<h1>Point to WordPress.com</h1>
			<p>You can point your domain to WordPress.com to use it as a site address.</p>
		</Dialog>
	);
};
