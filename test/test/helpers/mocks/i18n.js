import identity from 'lodash/identity';
import noop from 'lodash/noop';
import toString from 'lodash/toString';

const i18n = {
	translate: identity,
	initialize: noop,
	numberFormat: toString
};

export default ( mockery ) => {
	mockery.registerMock( 'lib/mixins/i18n', i18n );
	return i18n;
};
