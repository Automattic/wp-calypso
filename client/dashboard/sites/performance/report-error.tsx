import { Notice, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const ReportError = ( { onRetestClick }: { onRetestClick(): void } ) => {
	return (
		<Notice status="error" isDismissible={ false }>
			<p>
				{ __(
					'An error occurred while testing your site. Try running the test again or contact support if the error persists.'
				) }
			</p>
			<Button variant="primary" onClick={ onRetestClick }>
				{ __( 'Re-run test' ) }
			</Button>
		</Notice>
	);
};
