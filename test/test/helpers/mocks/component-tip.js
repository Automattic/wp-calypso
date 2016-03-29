import noop from 'lodash/noop';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:test:mocks:component-tip' );

function MockTip() {}
[ 'message', 'attach', 'onmouseover', 'onmouseout', 'cancelHideOnHover', 'effect', 'position', 'show', 'reposition',
	'suggested', 'replaceClass', 'offset', 'cancelHide', 'hide', 'remove' ]
	.forEach( key => {
		MockTip.prototype[ key ] = noop;
	} );

export default ( mockery ) => {
	debug( 'Registering mock' );
	mockery.registerMock( 'component-tip', MockTip );
	return MockTip;
}
