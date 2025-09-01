import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';

const SiteBackupDownloadError = ( { onRetry }: { onRetry: () => void } ) => {
	return (
		<HStack spacing={ 4 }>
			<Notice variant="error" title={ __( 'Download failed' ) }>
				{ createInterpolateElement(
					__(
						'An error occurred while preparing your backup download. Please <button>try again</button> or contact our support team to resolve the issue.'
					),
					{
						button: <Button variant="link" onClick={ onRetry } />,
					}
				) }
			</Notice>
		</HStack>
	);
};

export default SiteBackupDownloadError;
