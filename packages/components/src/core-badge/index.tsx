import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import React from 'react';
import type { BadgeProps } from '@wordpress/components/src/badge/types';

// TODO: When the component is publicly available, we should remove the private API usage and
// import it directly from @wordpress/components as it will cause a build error.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { Badge } = unlock( privateApis );

/**
 * A wrapper component around WordPress's private [`Badge` component](https://wordpress.github.io/gutenberg/?path=/docs/components-badge--docs)
 * from `@wordpress/components`.
 *
 * ```jsx
 * import { CoreBadge } from '@automattic/components';
 *
 * function MyComponent() {
 * 	return <CoreBadge>Badge Content</CoreBadge>;
 * }
 * ```
 */
const CoreBadge = ( props: BadgeProps & React.HTMLAttributes< HTMLSpanElement > ) => {
	return <Badge { ...props } />;
};

export default CoreBadge;
