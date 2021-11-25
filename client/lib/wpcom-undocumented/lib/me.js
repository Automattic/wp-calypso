import debugFactory from 'debug';
import inherits from 'inherits';
import WPCOM from 'wpcom';

const debug = debugFactory( 'calypso:wpcom-undocumented:me' );

/**
 * Create an UndocumentedMe instance
 *
 * @param {WPCOM} wpcom - WPCOMUndocumented instance
 */
function UndocumentedMe( wpcom ) {
	debug( 'UndocumentedMe' );
	if ( ! ( this instanceof UndocumentedMe ) ) {
		return new UndocumentedMe( wpcom );
	}
	this.wpcom = wpcom;
}

/**
 * Inherits from Me class
 */
inherits( UndocumentedMe, WPCOM.Me );

export default UndocumentedMe;
