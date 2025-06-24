import { useTranslate } from 'i18n-calypso';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { urlToSlug } from 'calypso/lib/url/http-utils';
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
			title={ translate( 'Delete this report?' ) }
			onClose={ onClose }
			onConfirm={ onConfirm }
			closeLabel={ translate( 'Cancel' ) }
			ctaLabel={ translate( 'Delete report' ) }
			isDestructive
			isLoading={ isLoading }
		>
			{ translate(
				"The report for {{strong}}%(siteName)s{{/strong}} will be deleted permanently. This can't be undone. {{br/}}{{br/}}If it's already scheduled to be sent, it may still go out.",
				{
					args: { siteName: urlToSlug( report.data.managed_site_url ) },
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
