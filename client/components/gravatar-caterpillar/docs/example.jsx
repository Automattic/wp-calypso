/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import GravatarCaterpillar from 'components/gravatar-caterpillar';
import { users } from './fixtures';

function GravatarCaterpillarExample() {
	return <GravatarCaterpillar users={ users } />;
}

export default GravatarCaterpillarExample;
