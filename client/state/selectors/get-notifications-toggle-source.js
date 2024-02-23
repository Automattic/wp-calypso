import { get } from 'lodash';

export const getNotificationsToggleSource = ( state ) => {
	return get( state, 'ui.isNotificationsOpen.toggleSource', null );
};
