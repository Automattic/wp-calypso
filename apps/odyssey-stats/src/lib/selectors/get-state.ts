import config from '../config-api';

// TODO: fix `intial_state` typo.
export default () => config( 'intial_state' ) ?? {};
