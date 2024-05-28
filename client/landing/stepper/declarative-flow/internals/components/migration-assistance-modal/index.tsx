import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';
import { setMigrationAssistanceAccepted } from 'calypso/blocks/importer/wordpress/utils';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import './style.scss';

const EVENT_NAMES = {
	accepted: 'calypso_migration_assistance_modal_deal_accepted',
	declined: 'calypso_migration_assistance_modal_deal_declined',
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
	const urlQueryParams = useQuery();
	const importSiteHostName = props.migrateFrom || translate( 'your site' );
	const { data: urlData, isLoading } = useAnalyzeUrlQuery( importSiteHostName, true );
	const shouldShowModal = ! isLoading && urlData?.platform === 'wordpress';

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
		if ( ! shouldShowModal ) {
			urlQueryParams.delete( 'showModal' );
			return;
		}
		recordTracksEvent( 'calypso_migration_assistance_modal_loaded', {
			user_site: importSiteHostName,
		} );
	}, [ importSiteHostName, shouldShowModal ] );

	if ( ! shouldShowModal ) {
		return;
	}

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
