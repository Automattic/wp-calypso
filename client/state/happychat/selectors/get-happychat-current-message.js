/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/happychat/init';

export default ( state ) => get( state, 'happychat.ui.currentMessage' );
