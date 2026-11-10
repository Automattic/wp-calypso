import { createComponentImplementation } from '@a2ui/react';
import clsx from 'clsx';
import { z } from 'zod';
import { kebabCase } from '../utils/kebab-case';
import { StringValueSchema } from '../utils/schemas';

export const Image = createComponentImplementation(
	{
		name: 'Image',
		schema: z.object( {
			url: StringValueSchema,
			description: StringValueSchema.optional(),
			fit: z.enum( [ 'contain', 'cover', 'fill', 'none', 'scaleDown' ] ).optional(),
			variant: z
				.enum( [ 'icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header' ] )
				.optional(),
		} ),
	},
	( { props } ) => (
		<img
			src={ props.url }
			alt={ props.description ?? '' }
			className={ clsx(
				'ai-ui-renderer__image',
				`ai-ui-renderer__image--${ kebabCase( props.variant ?? 'mediumFeature' ) }`,
				`ai-ui-renderer__image--fit-${ kebabCase( props.fit ?? 'contain' ) }`
			) }
		/>
	)
);
