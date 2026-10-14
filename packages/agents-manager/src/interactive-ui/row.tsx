import { createComponentImplementation } from '@a2ui/react/v0_9';
import { RowApi, markChildRef } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

const justify = {
	start: 'flex-start',
	end: 'flex-end',
	center: 'center',
	spaceAround: 'space-around',
	spaceBetween: 'space-between',
	spaceEvenly: 'space-evenly',
	stretch: 'stretch',
};
const align = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch' };

export default createComponentImplementation(
	{
		name: RowApi.name,
		schema: RowApi.schema.pick( { children: true, justify: true, align: true } ).extend( {
			children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
		} ),
	},
	( { props, buildChild } ) => (
		<div
			style={ {
				display: 'flex',
				gap: 8,
				flexWrap: 'wrap',
				justifyContent: justify[ props.justify ?? 'start' ],
				alignItems: align[ props.align ?? 'stretch' ],
			} }
		>
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</div>
	)
);
