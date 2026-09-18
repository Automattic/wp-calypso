import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import type { AmplifyReportRow } from './use-report-rows';

type Props = {
	report: AmplifyReportRow;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
};

export default function ArchiveReportConfirmationDialog( {
	report,
	onClose,
	onConfirm,
	isLoading,
}: Props ) {
	return (
		<A4AConfirmationDialog
			title={ __( 'Archive this report?' ) }
			onClose={ onClose }
			onConfirm={ onConfirm }
			closeLabel={ __( 'Cancel' ) }
			ctaLabel={ __( 'Archive report' ) }
			isDestructive
			isLoading={ isLoading }
		>
			{ createInterpolateElement(
				sprintf(
					/* translators: %s is the URL of the site the report was generated for */
					__( 'The report for <strong>%s</strong> will be removed from your reports list.' ),
					report.url
				),
				{ strong: <strong /> }
			) }
		</A4AConfirmationDialog>
	);
}
