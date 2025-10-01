import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export default function ReportErrorNotice( { onRetestClick }: { onRetestClick: () => void } ) {
	return (
		<Notice
			variant="error"
			title={ __( 'An error occurred while testing your site.' ) }
			actions={
				<Button variant="primary" onClick={ onRetestClick }>
					{ __( 'Re-run test' ) }
				</Button>
			}
		>
			{ __( 'Try running the test again or contact support if the error persists.' ) }
		</Notice>
	);
}
