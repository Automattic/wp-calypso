import { createHigherOrderComponent } from '@wordpress/compose';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import getCurrentStream from 'calypso/state/selectors/get-reader-current-stream';

const buildReaderCollector = ( state ) => {
	const currentStream = getCurrentStream( state ) || '';

	return ( report ) => {
		// Report only the first part of the stream name, e.g. `tag` instead of `tag:tagName`.
		report.data.set( 'subSection', currentStream.split( ':' )[ 0 ] );
	};
};

const READER_EXTRA_COLLECTORS = [ buildReaderCollector ];

export const ReaderPerformanceTrackerStop = () => {
	return <PerformanceTrackerStop extraCollectors={ READER_EXTRA_COLLECTORS } />;
};

export const withReaderPerformanceTrackerStop = createHigherOrderComponent( ( Wrapped ) => {
	return function WithReaderPerformanceTrackerStop( props ) {
		return (
			<>
				<Wrapped { ...props } />
				<ReaderPerformanceTrackerStop />
			</>
		);
	};
}, 'WithReaderPerformanceTrackerStop' );
