import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, ImageApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );
const sizes = {
	icon: 24,
	avatar: 40,
	smallFeature: 100,
	mediumFeature: 240,
	largeFeature: 400,
	header: 400,
};
const heights = {
	icon: 24,
	avatar: 40,
	smallFeature: undefined,
	mediumFeature: undefined,
	largeFeature: undefined,
	header: 200,
};

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
			style={ {
				display: 'block',
				width: sizes[ props.variant ?? 'mediumFeature' ],
				maxWidth: '100%',
				height: heights[ props.variant ?? 'mediumFeature' ],
				borderRadius: props.variant === 'avatar' ? '50%' : undefined,
				objectFit: props.fit === 'scaleDown' ? 'scale-down' : ( props.fit ?? 'contain' ),
			} }
		/>
	)
);
