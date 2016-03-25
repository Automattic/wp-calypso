import debug from 'debug';
import nock from 'nock';

export { nock };

const log = debug( 'calypso:test:use-nock' );

export const useNock = () => {
	after( () => {
		log( 'Cleaning up nock' );
		nock.cleanAll();
	} )
};

export default useNock;
