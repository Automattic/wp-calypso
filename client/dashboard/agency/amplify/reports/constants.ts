import { __ } from '@wordpress/i18n';
import type { AmplifyMode } from '@automattic/api-core';

export interface AnalysisTypeOption {
	mode: AmplifyMode;
	title: string;
	description: string;
}

export const ANALYSIS_TYPES: AnalysisTypeOption[] = [
	{
		mode: 'human',
		title: __( 'Human-centric analysis' ),
		description: __( 'Score how potential clients perceive your site when they land on it.' ),
	},
	{
		mode: 'ai',
		title: __( 'AI analysis' ),
		description: __(
			'Score how AI tools like ChatGPT, Gemini, and Perplexity read and rank your site.'
		),
	},
	{
		mode: 'fullanalysis',
		title: __( 'Full analysis' ),
		description: __( 'Run both lenses for a complete picture and prompt-ready findings.' ),
	},
];
