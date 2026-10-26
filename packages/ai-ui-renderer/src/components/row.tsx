import { createComponentImplementation } from '@a2ui/react';
import clsx from 'clsx';
import { z } from 'zod';
import { kebabCase } from '../utils/kebab-case';
import { ChildIdsSchema } from '../utils/schemas';

export const Row = createComponentImplementation(
	{
		name: 'Row',
		schema: z.object( {
			children: ChildIdsSchema,
			justify: z
				.enum( [
					'center',
					'end',
					'spaceAround',
					'spaceBetween',
					'spaceEvenly',
					'start',
					'stretch',
				] )
				.optional(),
			align: z.enum( [ 'start', 'center', 'end', 'stretch' ] ).optional(),
		} ),
	},
	( { props, buildChild } ) => (
		<div
			className={ clsx(
				'ai-ui-renderer__row',
				`ai-ui-renderer__row--justify-${ kebabCase( props.justify ?? 'start' ) }`,
				`ai-ui-renderer__row--align-${ props.align ?? 'stretch' }`
			) }
		>
			{ props.children.map( ( child ) =>
				typeof child === 'string' ? buildChild( child ) : buildChild( child.id, child.basePath )
			) }
		</div>
	)
);
