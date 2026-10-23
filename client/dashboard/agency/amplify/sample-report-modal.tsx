import { Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { SAMPLE_REPORT_PAGES, SAMPLE_REPORT_SITE } from './sample-report-pages';

export default function AmplifySampleReportModal( { onClose }: { onClose: () => void } ) {
	return (
		<Modal
			className="dashboard-amplify-sample-report"
			title={ sprintf(
				/* translators: %s: name of the fictional business in the sample report */
				__( 'Sample report: %s' ),
				SAMPLE_REPORT_SITE
			) }
			size="large"
			onRequestClose={ onClose }
		>
			<div className="dashboard-amplify-sample-report__pages">
				{ SAMPLE_REPORT_PAGES.map( ( src, index ) => (
					<img
						key={ src }
						src={ src }
						loading={ index > 1 ? 'lazy' : 'eager' }
						alt={ sprintf(
							/* translators: 1: page number, 2: total number of pages */
							__( 'Sample report, page %1$d of %2$d' ),
							index + 1,
							SAMPLE_REPORT_PAGES.length
						) }
					/>
				) ) }
				<p className="dashboard-amplify-sample-report__note">
					{ __( 'A sample report for a fictional restaurant.' ) }
				</p>
			</div>
		</Modal>
	);
}
