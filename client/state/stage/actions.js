/** @format */

/**
 * Internal dependencies
 */
import { STAGE_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/stage';

export const requestStage = siteId => ( {
	type: STAGE_REQUEST,
	siteId,
} );
