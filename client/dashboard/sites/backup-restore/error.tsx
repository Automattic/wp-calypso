import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';

const SiteBackupRestoreError = ( { onRetry }: { onRetry: () => void } ) => {
	return (
		<HStack spacing={ 4 }>
			<Notice variant="error" title={ __( 'Restore failed' ) }>
				{ createInterpolateElement(
					__(
						'An error occurred while restoring your site. Please <button>try your restore again</button> or contact our support team to resolve the issue.'
					),
					{
						button: <Button variant="link" onClick={ onRetry } />,
					}
				) }
			</Notice>
		</HStack>
	);
};

export default SiteBackupRestoreError;
