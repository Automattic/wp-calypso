import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BuildReportModal from './components/build-report-modal';

import './style.scss';

export default function ReportsComponent() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const pageTitle = translate( 'Reports' );
	const [ isModalOpen, setModalOpen ] = useState( false );

	const closeModal = () => setModalOpen( false );

	const handleOpenModal = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_build_report_button_click' ) );
		setModalOpen( true );
	};

	return (
		<Layout title={ pageTitle } wide>
			<LayoutBody className="a4a-reports-content">
				<div style={ { padding: 32 } }>
					<h1>{ pageTitle }</h1>
					<p>{ translate( 'This is the Reports section. Content coming soon.' ) }</p>
					<Button variant="primary" onClick={ handleOpenModal }>
						{ translate( 'Build Report' ) }
					</Button>
				</div>
				<BuildReportModal isOpen={ isModalOpen } onClose={ closeModal } />
			</LayoutBody>
		</Layout>
	);
}
