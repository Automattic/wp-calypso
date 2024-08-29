import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

type WeeklyReportProps = {
	url: string;
	hash: string;
};

export const WeeklyReport = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const updateQueryParams = ( params: Record< string, string >, forceReload = false ) => {
		const queryParams = new URLSearchParams( window.location.search );
		Object.keys( params ).forEach( ( key ) => {
			if ( params[ key ] ) {
				queryParams.set( key, params[ key ] );
			}
		} );

		// If forceReload is true, we want to reload the page with the new query params instead of just updating the URL
		if ( forceReload ) {
			page( `/speed-test-tool?${ queryParams.toString() }` );
		} else {
			window.history.replaceState( {}, '', `?${ queryParams.toString() }` );
		}
	};

	return (
		<div className="peformance-profiler-weekly-report-container">
			<DocumentHead title={ translate( 'Speed Test weekly reports' ) } />
			This is the performance profiler weekly report page.
		</div>
	);
};
