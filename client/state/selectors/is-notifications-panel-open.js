/**
 * External dependencies
 */
import { get } from 'lodash';

export const isNotificationsPanelOpen = ( { ui } ) => get( ui, 'notifications.open', false );

export default isNotificationsPanelOpen;
