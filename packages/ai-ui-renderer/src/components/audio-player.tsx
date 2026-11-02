import { createComponentImplementation } from '@a2ui/react';
import { useId } from '@wordpress/element';
import { z } from 'zod';
import { StringValueSchema } from '../utils/schemas';

export const AudioPlayer = createComponentImplementation(
	{
		name: 'AudioPlayer',
		schema: z.object( { url: StringValueSchema, description: StringValueSchema.optional() } ),
	},
	( { props } ) => {
		const descriptionId = useId();

		// Shown above the player and naming it, as A2UI's reference renderer shows it.
		return (
			<div className="ai-ui-renderer__audio-player">
				{ props.description && <div id={ descriptionId }>{ props.description }</div> }
				{ /* eslint-disable-next-line jsx-a11y/media-has-caption -- The A2UI catalog does not provide caption tracks. */ }
				<audio
					key={ props.url }
					src={ props.url }
					aria-labelledby={ props.description ? descriptionId : undefined }
					controls
					preload="metadata"
				/>
			</div>
		);
	}
);
