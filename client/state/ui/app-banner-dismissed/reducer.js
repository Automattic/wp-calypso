import { APP_BANNER_DISMISSED } from 'calypso/state/action-types';

export default ( state = null, { type } ) => ( type === APP_BANNER_DISMISSED ? true : state );
