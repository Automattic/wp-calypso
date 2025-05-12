import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import type { PageHeaderProps } from './types';

import './style.scss';

/**
 * The PageHeader component provides a structured introduction to a page or section,
 * combining a title, optional description, and contextual actions. It supports
 * varying levels of hierarchy through semantic heading levels, and can include
 * visual decorations, navigational aids like breadcrumbs, and utility controls
 * such as buttons or dropdowns.
 *
 * ```jsx
 * import { PageHeader } from '@automattic/components';
 * import { Button } from '@wordpress/components';
 * import { cog } from '@wordpress/icons';
 *
 * function MyComponent() {
 * 	return (
 * 		<PageHeader
 * 			title="Settings"
 * 			description="Configure your application settings"
 * 			decoration={<Icon icon={cog} />}
 * 			actions={<Button variant="primary">Save Changes</Button>}
 * 		/>
 * 	);
 * }
 * ```
 */
export const PageHeader = ( {
	level = 1,
	title,
	description,
	actions,
	decoration,
	breadcrumbs,
}: PageHeaderProps ) => {
	return (
		<VStack spacing={ 2 }>
			{ !! breadcrumbs?.length && <Breadcrumbs items={ breadcrumbs } /> }
			<HStack spacing={ 4 } justify="space-between" alignment="center" wrap>
				<HStack spacing={ 4 } justify="flex-start" expanded={ false }>
					{ decoration && (
						<span className="client-dashboard-components-page-header-decoration">
							{ decoration }
						</span>
					) }
					<Heading level={ level }>{ title }</Heading>
				</HStack>
				{ !! actions?.length && (
					<HStack spacing={ 4 } justify="flex-start" expanded={ false } wrap>
						{ actions }
					</HStack>
				) }
			</HStack>
			{ description && <Text variant="muted">{ description }</Text> }
		</VStack>
	);
};
