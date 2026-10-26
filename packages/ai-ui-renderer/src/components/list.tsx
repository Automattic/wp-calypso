import { createComponentImplementation } from '@a2ui/react';
import clsx from 'clsx';
import { z } from 'zod';
import { ChildIdsSchema } from '../utils/schemas';

export const List = createComponentImplementation(
	{
		name: 'List',
		schema: z.object( {
			children: ChildIdsSchema,
			direction: z.enum( [ 'vertical', 'horizontal' ] ).optional(),
			align: z.enum( [ 'start', 'center', 'end', 'stretch' ] ).optional(),
		} ),
	},
	( { props, buildChild } ) => (
		// Safari drops the list role of a list without markers.
		// eslint-disable-next-line jsx-a11y/no-redundant-roles
		<ul
			role="list"
			className={ clsx(
				'ai-ui-renderer__list',
				{ 'ai-ui-renderer__list--horizontal': props.direction === 'horizontal' },
				`ai-ui-renderer__list--align-${ props.align ?? 'stretch' }`
			) }
		>
			{ props.children.map( ( child ) => (
				<li
					key={ typeof child === 'string' ? child : child.id }
					className="ai-ui-renderer__list-item"
				>
					{ typeof child === 'string'
						? buildChild( child )
						: buildChild( child.id, child.basePath ) }
				</li>
			) ) }
		</ul>
	)
);
