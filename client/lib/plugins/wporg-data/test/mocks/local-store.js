
/**
 * External dependencies
 */
import sinon from 'sinon';

const get = sinon.spy(),
	set = sinon.spy();

export default {
	get,
	set,
	reset() {
		get.reset();
		set.reset();
	}
};
