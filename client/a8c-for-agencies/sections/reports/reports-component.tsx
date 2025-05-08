import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';

import './style.scss';

export default function ReportsComponent() {
	const translate = useTranslate();
	const title = translate( 'Reports' );
	const [ isModalOpen, setModalOpen ] = useState( false );

	const openModal = () => setModalOpen( true );
	const closeModal = () => setModalOpen( false );

	return (
		<Layout title={ title } wide>
			<LayoutBody className="a4a-reports-content">
				<div style={ { padding: 32 } }>
					<h1>{ title }</h1>
					<p>{ translate( 'This is the Reports section. Content coming soon.' ) }</p>
					<Button variant="primary" onClick={ openModal }>
						{ translate( 'Build Report' ) }
					</Button>
				</div>
				{ isModalOpen && (
					<Modal title={ translate( 'Build Report' ) } onRequestClose={ closeModal }>
						{ /* Modal content will go here */ }
						<p>{ translate( 'Modal content is under construction.' ) }</p>
						<Button variant="secondary" onClick={ closeModal }>
							{ translate( 'Close' ) }
						</Button>
					</Modal>
				) }
			</LayoutBody>
		</Layout>
	);
}
