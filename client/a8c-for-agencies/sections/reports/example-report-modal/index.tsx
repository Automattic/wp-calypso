import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useMinimizeHelpCenterOnMount from 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount';
import ExampleReport from '../primary/overview/example-report';

import './style.scss';

type Props = {
	isVisible: boolean;
	onClose: () => void;
};

export default function ExampleReportModal( { isVisible, onClose }: Props ) {
	const translate = useTranslate();
	useMinimizeHelpCenterOnMount();

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Modal
			title={ translate( 'Example client report' ) }
			onRequestClose={ onClose }
			className="example-report-modal"
			bodyOpenClassName="example-report-modal-body"
			isFullScreen
		>
			<ExampleReport />
		</Modal>
	);
}
