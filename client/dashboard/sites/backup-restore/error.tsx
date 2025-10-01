import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';

const SiteBackupRestoreError = ( { onRetry }: { onRetry: () => void } ) => {
	const { recordTracksEvent } = useAnalytics();

	const handleRetry = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_retry_click' );
		onRetry();
	};

	return (
		<HStack spacing={ 4 }>
			<Notice variant="error" title={ __( 'Restore failed' ) }>
				{ createInterpolateElement(
					__(
						'An error occurred while restoring your site. Please <button>try your restore again</button> or contact our support team to resolve the issue.'
					),
					{
						button: <Button variant="link" onClick={ handleRetry } />,
					}
				) }
			</Notice>
		</HStack>
	);
};

export default SiteBackupRestoreError;
