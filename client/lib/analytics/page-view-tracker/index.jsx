import analytics from 'lib/analytics';
import PageViewTracker from './component';

const recorder = ( path, title ) => analytics.pageView( path, title );

const Tracker = PageViewTracker( recorder );

export default Tracker;
