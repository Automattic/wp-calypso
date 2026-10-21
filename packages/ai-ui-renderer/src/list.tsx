import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ListApi, markChildRef } from '@a2ui/web_core/v0_9';
import clsx from 'clsx';
import { z } from 'zod';

export default createComponentImplementation(
	{
		name: ListApi.name,
		schema: ListApi.schema.pick( { children: true, direction: true, align: true } ).extend( {
			children: markChildRef( z.array( z.string().min( 1 ) ), 'child-list' ),
		} ),
	},
	( { props, buildChild } ) => (
		<ul
			className={ clsx(
				'agents-manager-interactive-ui__list',
				`agents-manager-interactive-ui__list--${ props.direction ?? 'vertical' }`,
				`agents-manager-interactive-ui__list--align-${ props.align ?? 'stretch' }`
			) }
		>
			{ props.children.map( ( child ) => (
				<li
					key={ typeof child === 'string' ? child : child.id }
					className="agents-manager-interactive-ui__list-item"
				>
					{ typeof child === 'string'
						? buildChild( child )
						: buildChild( child.id, child.basePath ) }
				</li>
			) ) }
		</ul>
	)
);
