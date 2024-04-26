import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';
import { setMigrationAssistanceAccepted } from 'calypso/blocks/importer/wordpress/utils';
import './style.scss';
interface MigrationAssistanceModalProps {
	navigateBack: ( () => void ) | undefined;
	migrateFrom: string | null;
	onConfirm: ( () => void ) | undefined;
}
export const MigrationAssistanceModal: React.FunctionComponent< MigrationAssistanceModalProps > = (
	props: MigrationAssistanceModalProps
) => {
	const translate = useTranslate();
	const importSiteHostName = props.migrateFrom || translate( 'your site' );

	const acceptMigrationAssistance = () => {
		setMigrationAssistanceAccepted();
		props.onConfirm?.();
	};
	return (
		<ConfirmModal
			compact={ false }
			title={ translate( 'Migration sounds daunting? It shouldn’t be!' ) }
			confirmText={ translate( 'Take the deal' ) }
			cancelText={ translate( 'No, thanks' ) }
			onClose={ props.navigateBack }
			onConfirm={ acceptMigrationAssistance }
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
