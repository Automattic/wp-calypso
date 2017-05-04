/**
 * External dependencies
 */
import { get } from 'lodash';

export const getNotificationsNewNoteStatus = ( { ui } ) => get( ui, 'notifications.newNote', false );

export default getNotificationsNewNoteStatus;
