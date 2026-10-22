import { createComponentImplementation } from '@a2ui/react';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { z } from 'zod';
import { ChildIdsSchema } from '../utils/schemas';

export const Column = createComponentImplementation(
	{
		name: 'Column',
		schema: z.object( { children: ChildIdsSchema } ),
	},
	( { props, buildChild } ) => (
		<VStack spacing={ 2 }>
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</VStack>
	)
);
