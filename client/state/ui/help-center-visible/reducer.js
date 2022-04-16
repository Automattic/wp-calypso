import { HELP_CENTER_VISIBLE } from 'calypso/state/action-types';

export default ( state = null, { type, value } ) =>
	type === HELP_CENTER_VISIBLE ? value : state;
