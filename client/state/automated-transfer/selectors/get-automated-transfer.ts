import { get } from 'lodash';

import 'calypso/state/automated-transfer/init';

export const getAutomatedTransfer = ( state, siteId: number | null ) =>
	get( state, [ 'automatedTransfer', siteId ], {} );
