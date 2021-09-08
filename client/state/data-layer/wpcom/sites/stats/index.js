import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import googleMyBusiness from './google-my-business';
import recentPostViews from './views/posts';
import chartCounts from './visits';

export default mergeHandlers( recentPostViews, googleMyBusiness, chartCounts );
