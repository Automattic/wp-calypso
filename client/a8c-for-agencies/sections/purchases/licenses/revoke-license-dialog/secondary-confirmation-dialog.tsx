import { useTranslate } from 'i18n-calypso';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';

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
		<A4AConfirmationDialog
			title={ title }
			ctaLabel={ translate( 'Revoke Pressable plan license' ) }
			onClose={ onCancel }
			onConfirm={ onConfirm }
			isLoading={ isPending }
			isDestructive
		>
			{ description }
		</A4AConfirmationDialog>
	);
}
