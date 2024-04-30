import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';
import { setMigrationAssistanceAccepted } from 'calypso/blocks/importer/wordpress/utils';
import './style.scss';

const EVENT_NAMES = {
	accepted: 'calypso_migration_assistance_modal_deal_accepted',
	declined: 'calypso_migration_assistance_modal_no_thanks_or_closed',
};

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

	const logEvent = ( acceptedDeal: boolean = false ) => {
		const eventName = acceptedDeal ? EVENT_NAMES.accepted : EVENT_NAMES.declined;
		recordTracksEvent( eventName, {
			user_site: importSiteHostName,
		} );
	};

	const navigateBackOrCloseModal = () => {
		logEvent();
		props.navigateBack?.();
	};

	const acceptMigrationAssistance = () => {
		const acceptedDeal = true;
		setMigrationAssistanceAccepted();
		logEvent( acceptedDeal );
		props.onConfirm?.();
	};

	useEffect( () => {
		recordTracksEvent( 'calypso_migration_assistance_modal_loaded', {
			user_site: importSiteHostName,
		} );
	}, [ importSiteHostName ] );

	return (
		<ConfirmModal
			compact={ false }
			title={ translate( 'Migration sounds daunting? It shouldn’t be!' ) }
			confirmText={ translate( 'Take the deal' ) }
			cancelText={ translate( 'No, thanks' ) }
			onClose={ navigateBackOrCloseModal }
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
