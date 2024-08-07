import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	siteName: string;
	onClose: () => void;
	onConfirm?: () => void;
	busy?: boolean;
};

export function SiteRemoveConfirmationDialog( { siteName, onConfirm, onClose, busy }: Props ) {
	const translate = useTranslate();

	const title = translate( 'Remove site' );

	return (
		<Dialog
			label={ title }
			isVisible
			additionalClassNames="site-remove-confirmation-dialog"
			onClose={ onClose }
			buttons={ [
				<Button key="cancel-button" onClick={ onClose } disabled={ busy }>
					{ translate( 'Cancel' ) }
				</Button>,

				<Button
					key="remove-site-button"
					primary
					scary
					disabled={ busy }
					busy={ busy }
					onClick={ onConfirm }
				>
					{ translate( 'Remove site' ) }
				</Button>,
			] }
		>
			<h2 className="site-remove-confirmation-dialog__heading">{ title }</h2>

			{ translate(
				'Are you sure you want to remove the site {{b}}%(siteName)s{{/b}} from the dashboard?',
				{
					args: { siteName },
					components: {
						b: <b />,
					},
					comment: '%(siteName)s is the site name',
				}
			) }
		</Dialog>
	);
}
