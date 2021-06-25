/**
 * Internal dependencies
 */
import { LOGIN_FORM_UPDATE } from 'calypso/state/action-types';

import 'calypso/state/login/init';

export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );
