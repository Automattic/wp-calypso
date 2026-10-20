import { createComponentImplementation } from '@a2ui/react/v0_9';
import { AudioPlayerApi, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );

export const AudioPlayer = createComponentImplementation(
	{
		name: AudioPlayerApi.name,
		schema: AudioPlayerApi.schema.pick( { url: true, description: true } ).extend( {
			url: dynamicString,
			description: dynamicString.optional(),
		} ),
	},
	( { props } ) => (
		// eslint-disable-next-line jsx-a11y/media-has-caption -- The A2UI catalog does not provide caption tracks.
		<audio
			key={ props.url }
			src={ props.url }
			aria-label={ props.description }
			controls
			preload="metadata"
			className="agents-manager-interactive-ui__audio-player"
		/>
	)
);
