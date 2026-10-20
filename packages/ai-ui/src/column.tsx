import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ColumnApi, markChildRef } from '@a2ui/web_core/v0_9';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { z } from 'zod';

const Column = createComponentImplementation(
	{
		name: ColumnApi.name,
		schema: ColumnApi.schema.pick( { children: true } ).extend( {
			children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
		} ),
	},
	( { props, buildChild } ) => (
		<VStack spacing={ 2 }>
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</VStack>
	)
);

export default Column;
