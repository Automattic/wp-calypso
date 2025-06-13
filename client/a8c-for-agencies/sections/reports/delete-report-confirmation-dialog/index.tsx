import { useTranslate } from 'i18n-calypso';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import type { Report } from '../types';

type Props = {
	report: Report;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
};

export default function DeleteReportConfirmationDialog( {
	report,
	onClose,
	onConfirm,
	isLoading,
}: Props ) {
	const translate = useTranslate();

	return (
		<A4AConfirmationDialog
			title={ translate( 'Are you sure you want to delete this report?' ) }
			onClose={ onClose }
			onConfirm={ onConfirm }
			closeLabel={ translate( 'Keep report' ) }
			ctaLabel={ translate( 'Delete report' ) }
			isDestructive
			isLoading={ isLoading }
		>
			{ translate(
				'This report for {{strong}}%(siteName)s{{/strong}} will be permanently deleted. This action cannot be undone. {{br/}}{{br/}}Note: If the report is already queued for sending, it may still be delivered.',
				{
					args: { siteName: report.site },
					components: {
						strong: <strong />,
						br: <br />,
					},
					comment: '%(siteName)s is the site name for the report being deleted',
				}
			) }
		</A4AConfirmationDialog>
	);
}
