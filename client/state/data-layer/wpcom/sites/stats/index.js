/**
 * Internal dependencies
 */
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import recentPostViews from './views/posts';
import chartCounts from './visits';
import googleMyBusiness from './google-my-business';

export default mergeHandlers( recentPostViews, googleMyBusiness, chartCounts );
