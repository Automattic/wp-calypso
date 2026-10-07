import { Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { SAMPLE_PAGES, SampleReportPage } from './sample-report';
import { getSampleSite } from './sample-report-data';
import type { SamplePageKey } from './sample-report';

/**
 * Full sample report, page by page. Opens scrolled to `initialPage`.
 */
export default function AmplifySampleReportModal( {
	initialPage = 'cover',
	onClose,
}: {
	initialPage?: SamplePageKey;
	onClose: () => void;
} ) {
	const viewportRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		viewportRef.current
			?.querySelector< HTMLElement >( `[data-page="${ initialPage }"]` )
			?.scrollIntoView( { block: 'start' } );
	}, [ initialPage ] );

	return (
		<Modal
			className="dashboard-amplify-sample-report"
			title={ sprintf(
				/* translators: %s: name of the fictional business in the sample report */
				__( 'Sample report: %s' ),
				getSampleSite().name
			) }
			size="large"
			onRequestClose={ onClose }
		>
			<div
				ref={ viewportRef }
				className="dashboard-amplify-sample-report__pages"
				role="region"
				aria-label={ __( 'Sample report pages' ) }
				// Scrollable report pages need keyboard focus.
				// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
				tabIndex={ 0 }
			>
				{ SAMPLE_PAGES.map( ( page ) => (
					<SampleReportPage key={ page } page={ page } />
				) ) }
			</div>
			<p className="dashboard-amplify-sample-report__disclaimer">
				{ __( 'Sample report for a fictional restaurant.' ) }
			</p>
		</Modal>
	);
}
