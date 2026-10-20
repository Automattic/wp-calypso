import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, ImageApi } from '@a2ui/web_core/v0_9';
import clsx from 'clsx';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );

export default createComponentImplementation(
	{
		name: ImageApi.name,
		schema: ImageApi.schema
			.pick( { url: true, description: true, fit: true, variant: true } )
			.extend( {
				url: dynamicString,
				description: dynamicString.optional(),
			} ),
	},
	( { props } ) => (
		<img
			src={ props.url }
			alt={ props.description ?? '' }
			className={ clsx(
				'automattic-interactive-ui__image',
				`automattic-interactive-ui__image--${ props.variant ?? 'mediumFeature' }`,
				`automattic-interactive-ui__image--fit-${ props.fit ?? 'contain' }`
			) }
		/>
	)
);
