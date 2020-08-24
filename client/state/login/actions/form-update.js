/**
 * Internal dependencies
 */
import { LOGIN_FORM_UPDATE } from 'state/action-types';

import 'state/login/init';

export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );
