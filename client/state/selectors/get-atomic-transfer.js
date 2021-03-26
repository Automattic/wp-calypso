/**
 * Internal dependencies
 */
import 'calypso/state/atomic-transfer/init';

export default ( state, siteId ) => state.atomicTransfer?.[ siteId ] ?? {};
