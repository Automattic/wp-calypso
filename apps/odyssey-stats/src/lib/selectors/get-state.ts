import { optionalConfig } from '../config-api';

// TODO: fix `intial_state` typo.
export default () => optionalConfig( 'intial_state' ) ?? {};
