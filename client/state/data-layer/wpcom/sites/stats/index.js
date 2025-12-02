import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import googleMyBusiness from './google-my-business';
import highlights from './highlights';
import notices from './notices';
import chartCounts from './visits';

export default mergeHandlers( googleMyBusiness, chartCounts, highlights, notices );
