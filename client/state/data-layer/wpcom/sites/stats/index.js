import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import googleMyBusiness from './google-my-business';
import highlights from './highlights';
import notices from './notices';
import recentPostViews from './views/posts';
import chartCounts from './visits';

export default mergeHandlers( recentPostViews, googleMyBusiness, chartCounts, highlights, notices );
