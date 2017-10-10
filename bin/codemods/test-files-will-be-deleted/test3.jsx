// Testing destructured React.createClass usage, with arbitrary args.

/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { localize } from 'i18n-calypso';

export default localize(
	'someArgument',
	React.createClass( {
		displayName: 'FormInputValidation',

		render: function() {
			return <div />;
		},
	} ),
	'someOtherArgument',
	1234
);
