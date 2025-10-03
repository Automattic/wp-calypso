import { useTranslate } from 'i18n-calypso';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import type { Report } from '../types';

import './style.scss';

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
			<div className="delete-report-confirmation-dialog__content">
				<div>
					{ translate(
						"The report for {{strong}}%(siteName)s{{/strong}} will be deleted permanently. This can't be undone.",
						{
							args: { siteName: urlToSlug( report.data.managed_site_url ) },
							components: {
								strong: <strong />,
							},
							comment: '%(siteName)s is the site name for the report being deleted',
						}
					) }
				</div>
				<div>{ translate( "If it's already scheduled to be sent, it may still go out." ) }</div>
			</div>
		</A4AConfirmationDialog>
	);
}
