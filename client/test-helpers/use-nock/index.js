import debug from 'debug';
import nock from 'nock';

export { nock };

const log = debug( 'calypso:test:use-nock' );

/**
 * @param {Function} setupCallback Function executed before all tests are run.
 * @deprecated Use nock directly instead.
 */
export const useNock = ( setupCallback ) => {
	if ( setupCallback ) {
		beforeAll( () => setupCallback( nock ) );
	}
	afterAll( () => {
		log( 'Cleaning up nock' );
		nock.cleanAll();
	} );
};

export default useNock;
