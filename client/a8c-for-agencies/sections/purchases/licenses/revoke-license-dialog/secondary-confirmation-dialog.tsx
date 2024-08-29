import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	title: string;
	description: string;
	onConfirm: () => void;
	onCancel: () => void;
	isPending?: boolean;
};

export function SecondaryConfirmationDialog( {
	title,
	description,
	onConfirm,
	onCancel,
	isPending,
}: Props ) {
	const translate = useTranslate();

	return (
		<Dialog
			isVisible
			additionalClassNames="revoke-license-dialog"
			onClose={ close }
			buttons={ [
				<Button disabled={ false } onClick={ onCancel } key="cancel-secondary-confirmation">
					{ translate( 'Cancel' ) }
				</Button>,

				<Button
					primary
					scary
					busy={ isPending }
					onClick={ onConfirm }
					key="confirm-secondary-confirmation"
				>
					{ translate( 'Continue revoke' ) }
				</Button>,
			] }
		>
			<h2 className="revoke-license-dialog__heading">{ title }</h2>

			{ description }
		</Dialog>
	);
}
