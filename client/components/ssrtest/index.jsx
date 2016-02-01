/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';

const SSRTest = () => (
	<Main>
		<Card>
			<span>Rendered on the Server</span>
		</Card>
	</Main>
)

export default SSRTest;
