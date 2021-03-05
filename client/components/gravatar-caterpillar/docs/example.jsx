/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GravatarCaterpillar from 'calypso/components/gravatar-caterpillar';
import { users } from './fixtures';

function GravatarCaterpillarExample() {
	return <GravatarCaterpillar users={ users } />;
}
GravatarCaterpillarExample.displayName = 'GravatarCaterpillarExample';

export default GravatarCaterpillarExample;
