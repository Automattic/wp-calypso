import noop from 'lodash/noop';

function MockComponentClasses() {
}
[ 'add', 'remove', 'removeMatching', 'toggle', 'array', 'has', 'contains' ]
	.forEach( key => {
		MockComponentClasses.prototype[ key ] = noop;
	} );

export default {
	before( mockery ) {
		mockery.registerMock( 'component-classes', MockComponentClasses )
	},
	after( mockery ) {
		mockery.deregisterMock( 'component-classes' )
	}
}
