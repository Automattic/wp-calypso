import { useTranslate } from 'i18n-calypso';
import React from 'react';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';

interface Props {
	navigateBack?: () => void;
	migratingTo?: string | null;
	onConfirm?: () => void;
}
export const MigrationAssistanceModal: React.FunctionComponent< Props > = ( props: Props ) => {
	const translate = useTranslate();
	const importSiteHostName = props.migratingTo || translate( 'your site' );

	return (
		<ConfirmModal
			compact={ false }
			title={ translate( 'Migration sounds daunting? It shouldn’t be!' ) }
			confirmText={ translate( 'Take the deal' ) }
			cancelText={ translate( 'No, thanks' ) }
			onClose={ props.navigateBack }
			onConfirm={ () => {} }
		>
			<p>
				{ translate(
					`Subscribe to the Creator plan now, and get a complimentary migration service (normally $500) to move %(importSiteHostName)s to WordPress.com.`,
					{
						args: {
							importSiteHostName,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'Take this deal now and let our Happiness Engineers make the move seamless and stress-free.'
				) }
			</p>
		</ConfirmModal>
	);
};
