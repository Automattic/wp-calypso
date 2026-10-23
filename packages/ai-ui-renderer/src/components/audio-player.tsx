import { createComponentImplementation } from '@a2ui/react';
import { z } from 'zod';
import { StringValueSchema } from '../utils/schemas';

export const AudioPlayer = createComponentImplementation(
	{
		name: 'AudioPlayer',
		schema: z.object( { url: StringValueSchema, description: StringValueSchema.optional() } ),
	},
	( { props } ) => (
		// eslint-disable-next-line jsx-a11y/media-has-caption -- The A2UI catalog does not provide caption tracks.
		<audio
			key={ props.url }
			src={ props.url }
			aria-label={ props.description }
			controls
			preload="metadata"
			className="ai-ui-renderer__audio-player"
		/>
	)
);
