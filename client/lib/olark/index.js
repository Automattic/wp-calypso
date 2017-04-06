/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import emitter from 'lib/mixins/emitter';
import userModule from 'lib/user';
import notices from 'notices';
import olarkActions from 'lib/olark-store/actions';
import { setChatAvailability } from 'state/ui/olark/actions';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:olark' );
const user = userModule();
const wpcomUndocumented = wpcom.undocumented();

/**
 * Loads the Olark store so that it can start receiving actions
 * This is necessary here to capture events that occur in the Olark
 * module before the React tree gets drawn.
 */
require( 'lib/olark-store' );

const olark = {

	apiId: 1,

	eligibilityKey: 'SupportChat',

	userType: 'Unknown',

	initialize( dispatch ) {
		debug( 'Initializing Olark Live Chat' );

		this.getOlarkConfiguration()
			.then( ( configuration ) => this.configureOlark( configuration, dispatch ) )
			.catch( ( error ) => this.handleError( error ) );
	},

	handleError: function( error ) {
		// Hides notices for authorization errors as they should be legitimate (e.g. we use this error code to check
		// whether the user is logged in when fetching the user profile)
		if ( error && error.message && error.error !== 'authorization_required' ) {
			notices.error( error.message );
		}
	},

	getOlarkConfiguration: function() {
		return new Promise( ( resolve, reject ) => {
			// TODO: Maybe store this configuration in local storage? The problem is that the configuration for a user could
			// change if they purchase upgrades or if their upgrades expire. There's also throttling that happens for unpaid users.
			// There is lots to consider before storing this configuration
			debug( 'Using rest api to get olark configuration' );
			const clientSlug = config( 'client_slug' );

			wpcomUndocumented.getOlarkConfiguration( clientSlug, ( error, configuration ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( configuration );
			} );
		} );
	},

	configureOlark: function( wpcomOlarkConfig = {}, dispatch ) {
		const userData = user.get();

		this.setOlarkOptions( userData, wpcomOlarkConfig );

		dispatch( setChatAvailability( wpcomOlarkConfig.availability ) );
	},

	updateOlarkGroupAndEligibility() {
		this.getOlarkConfiguration()
			.then( ( configuration ) => {
				const isUserEligible = ( 'undefined' === typeof configuration.isUserEligible ) ? true : configuration.isUserEligible;
				olarkActions.setUserEligibility( isUserEligible );
			} )
			.catch( ( error ) => this.handleError( error ) );
	},

	setOlarkOptions( userData, wpcomOlarkConfig = {} ) {
		const isUserEligible = ( 'undefined' === typeof wpcomOlarkConfig.isUserEligible ) ? true : wpcomOlarkConfig.isUserEligible;

		olarkActions.setUserEligibility( isUserEligible );
		olarkActions.setClosed( wpcomOlarkConfig.isClosed );

		if ( wpcomOlarkConfig.locale ) {
			olarkActions.setLocale( wpcomOlarkConfig.locale );
		}
	},
};

emitter( olark );

module.exports = olark;
