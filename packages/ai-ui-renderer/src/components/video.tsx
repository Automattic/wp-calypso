import { createComponentImplementation } from '@a2ui/react';
import { z } from 'zod';
import { StringValueSchema } from '../utils/schemas';

export const Video = createComponentImplementation(
	{
		name: 'Video',
		schema: z.object( { url: StringValueSchema } ),
	},
	( { props } ) => (
		// eslint-disable-next-line jsx-a11y/media-has-caption -- The A2UI catalog does not provide caption tracks.
		<video
			key={ props.url }
			src={ props.url }
			controls
			preload="metadata"
			className="ai-ui-renderer__video"
		/>
	)
);
