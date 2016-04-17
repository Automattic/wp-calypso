import analytics from 'lib/analytics';
import PageViewTracker from './component';

const recorder = ( path, title ) => analytics.pageView.record( path, title );

const Tracker = PageViewTracker( recorder );

export default Tracker;
