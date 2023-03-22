import { AKISMET_KEY_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/akismet-key/index';
import 'calypso/state/akismet-key/init';

export const fetchAkismetKey = () => ( {
	type: AKISMET_KEY_REQUEST,
} );
