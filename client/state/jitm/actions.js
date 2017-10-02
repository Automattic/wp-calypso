/**
 * Internal Dependencies
 */
import { JITM_DISMISS } from 'state/action-types.js';
import wpcom from 'lib/wp';

export const dismissJetpackJITM = ( dispatch, siteId, id, featureClass ) => {
	dispatch(
		{
			type: JITM_DISMISS,
			siteId,
			id,
			featureClass,
		}
	);

	return wpcom.undocumented().dismissJetpackJITM( siteId, id, featureClass );
};
