import { createComponentImplementation } from '@a2ui/react/v0_9';
import { RowApi, markChildRef } from '@a2ui/web_core/v0_9';
import clsx from 'clsx';
import { z } from 'zod';

export default createComponentImplementation(
	{
		name: RowApi.name,
		schema: RowApi.schema.pick( { children: true, justify: true, align: true } ).extend( {
			children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
		} ),
	},
	( { props, buildChild } ) => (
		<div
			className={ clsx(
				'automattic-interactive-ui__row',
				`automattic-interactive-ui__row--justify-${ props.justify ?? 'start' }`,
				`automattic-interactive-ui__row--align-${ props.align ?? 'stretch' }`
			) }
		>
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</div>
	)
);
