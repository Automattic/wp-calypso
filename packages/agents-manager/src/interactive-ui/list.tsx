import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ListApi, markChildRef } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

const align = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch' };

export default createComponentImplementation(
	{
		name: ListApi.name,
		schema: ListApi.schema.pick( { children: true, direction: true, align: true } ).extend( {
			children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
		} ),
	},
	( { props, buildChild } ) => (
		<ul
			style={ {
				display: 'flex',
				flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
				alignItems: align[ props.align ?? 'stretch' ],
				gap: 8,
				margin: 0,
				padding: 0,
				listStyle: 'none',
				overflow: 'auto',
			} }
		>
			{ props.children.map( ( child ) => (
				<li key={ typeof child === 'string' ? child : child.id } style={ { minWidth: 0 } }>
					{ typeof child === 'string'
						? buildChild( child )
						: buildChild( child.id, child.basePath ) }
				</li>
			) ) }
		</ul>
	)
);
