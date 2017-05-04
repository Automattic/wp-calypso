/**
 * External dependencies
 */
import { get } from 'lodash';

export const getNotificationsAnimationState = ( { ui } ) => get( ui, 'notifications.animationState', -1 );

export default getNotificationsAnimationState;
