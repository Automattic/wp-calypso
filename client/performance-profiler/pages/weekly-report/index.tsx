import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { MessageDisplay } from 'calypso/performance-profiler/components/message-display';

type WeeklyReportProps = {
	url: string;
	hash: string;
};

export const WeeklyReport = ( props: WeeklyReportProps ) => {
	const translate = useTranslate();
	const { url, hash } = props;

	const siteUrl = new URL( url );

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
			<MessageDisplay
				title={ translate( 'You’re all set!' ) }
				message={ translate(
					"We'll send you a weekly performance report for {{strong}}%s{{/strong}} so you can keep an eye on your site's speed. The first email is on it's way now.",
					{ args: [ siteUrl.host ], components: { strong: <strong /> } }
				) }
				ctaText={ translate( '← Back to speed test' ) }
				ctaHref="/speed-test"
				ctaIcon="arrow-left"
				secondaryMessage={ translate(
					'You can stop receiving performance reports at any time by clicking the Unsubscribe link in the email footer.'
				) }
			/>
		</div>
	);
};
