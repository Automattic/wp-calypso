import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import createFirstProjectPoster from '../assets/posters/create-first-project.webp';
import generateOutputsPoster from '../assets/posters/generate-outputs.webp';
import whatIsAgentStudioPoster from '../assets/posters/what-is-agent-studio.webp';
import type { IntroVideo } from 'calypso/a8c-for-agencies/components/a4a-intro-video-strip';

export default function useAgentStudioWelcomeVideos(): IntroVideo[] {
	return useMemo(
		() => [
			{
				id: 'what-is-agent-studio',
				title: __( 'See Agent studio in 60 seconds' ),
				durationLabel: '0:60',
				posterImageUrl: whatIsAgentStudioPoster,
			},
			{
				id: 'first-project',
				title: __( 'Turn a brief into a polished PDF' ),
				durationLabel: '1:20',
				posterImageUrl: createFirstProjectPoster,
			},
			{
				id: 'generate-outputs',
				title: __( 'Make social graphics for a campaign' ),
				durationLabel: '1:40',
				posterImageUrl: generateOutputsPoster,
			},
		],
		[]
	);
}
