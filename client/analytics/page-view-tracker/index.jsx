import analytics from 'analytics';
import PageViewTracker from './component';

const recorder = ( path, title ) => analytics.pageView( path, title );

const Tracker = PageViewTracker( recorder );

export default Tracker;
