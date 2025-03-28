import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { LogType, PHPLog, ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import DetailsModalPHP from './details-modal-php';
import DetailsModalServer from './details-modal-server';

interface Props {
	item: PHPLog | ServerLog;
	logType: LogType;
	onClose: () => void;
}

export default function DetailsModal( { item, logType, onClose }: Props ) {
	const translate = useTranslate();

	if ( logType === LogType.PHP ) {
		return (
			<Modal
				title={ translate( 'Log details' ) } /* Same title as dataviews action modal */
				onRequestClose={ onClose }
				focusOnMount="firstContentElement"
				size="large"
			>
				<DetailsModalPHP item={ item as PHPLog } />
			</Modal>
		);
	}

	return (
		<Modal
			title={ translate( 'Log details' ) } /* Same title as dataviews action modal */
			onRequestClose={ onClose }
			focusOnMount="firstContentElement"
			size="large"
		>
			<DetailsModalServer item={ item as ServerLog } />
		</Modal>
	);
}
