import debug from 'debug';
import nock from 'nock';
import partial from 'lodash/partial';

export { nock };

const log = debug( 'calypso:test:use-nock' );

/**
 * @param {Function} setupCallback Function executed before all tests are run.
 * @deprecated Use nock directly instead.
 */
export const useNock = ( setupCallback ) => {
	if ( setupCallback ) {
		before( partial( setupCallback, nock ) );
	}
	after( () => {
		log( 'Cleaning up nock' );
		nock.cleanAll();
	} );
};

export default useNock;
