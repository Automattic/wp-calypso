import { APP_BANNER_TOGGLE_VISIBILITY } from 'calypso/state/action-types';

export default ( state = true, { type, isVisible } ) =>
	type === APP_BANNER_TOGGLE_VISIBILITY ? isVisible : state;
