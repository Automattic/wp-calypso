/** @format */

/**
 * External dependencies
 */

import React from 'react';
/**
 * Internal dependencies
 */
import Count from 'components/count';
import ComponentPlayground from 'devdocs/design/component-playground';

export const countCode = '<Count primary count={ 65366 } />';
const code = `<div>


</div>`;
const scope = { Count };
const count = () => (
	<div>
		<ComponentPlayground code={ '<Count count={ 65365 } />' } scope={ scope } />
		<ComponentPlayground code={ countCode } scope={ scope } />
	</div>
);

count.displayName = 'Count';

export default count;
