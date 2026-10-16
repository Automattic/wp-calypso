import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DataBindingSchema, VideoApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

export const Video = createComponentImplementation(
	{
		name: VideoApi.name,
		schema: VideoApi.schema.pick( { url: true } ).extend( {
			url: z.union( [ z.string(), DataBindingSchema ] ),
		} ),
	},
	( { props } ) => (
		// eslint-disable-next-line jsx-a11y/media-has-caption -- The A2UI catalog does not provide caption tracks.
		<video
			key={ props.url }
			src={ props.url }
			controls
			preload="metadata"
			style={ { maxWidth: '100%', height: 'auto', alignSelf: 'flex-start' } }
		/>
	)
);
