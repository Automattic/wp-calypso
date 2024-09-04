import { useTranslate } from 'i18n-calypso';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';

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
		<A4AConfirmationDialog
			title={ title }
			onClose={ onClose }
			onConfirm={ onConfirm }
			ctaLabel={ translate( 'Remove site' ) }
			busy={ busy }
			scary
		>
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
		</A4AConfirmationDialog>
	);
}
