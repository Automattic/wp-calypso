import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import React from 'react';

const CoreBadge = ( { children }: { children: React.ReactNode } ) => {
	// TODO: When the component is publicly available, we should remove the private API usage and
	// import it directly from @wordpress/components as it will cause a build error.
	const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
		'@wordpress/components'
	);
	const { Badge } = unlock( privateApis );
	return <Badge>{ children }</Badge>;
};

export default CoreBadge;
