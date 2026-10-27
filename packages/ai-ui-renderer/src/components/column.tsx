import { createComponentImplementation } from '@a2ui/react';
import { Stack } from '@wordpress/ui';
import { z } from 'zod';
import { ChildIdsSchema } from '../utils/schemas';

export const Column = createComponentImplementation(
	{
		name: 'Column',
		schema: z.object( { children: ChildIdsSchema } ),
	},
	( { props, buildChild } ) => (
		<Stack direction="column" gap="sm" align="stretch">
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</Stack>
	)
);
