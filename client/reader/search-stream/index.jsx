/**
 * Internal Dependencies
 */
import config from 'config';
import WithoutSites from './without-sites';
import WithSites from './with-sites';

export default ( config.isEnabled( 'reader/sites-in-search' ) ? WithSites : WithoutSites );
