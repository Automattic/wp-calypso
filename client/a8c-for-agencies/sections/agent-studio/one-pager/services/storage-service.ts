import { agentStudioService } from '../../data/agent-studio-service';
import type { StorageService } from './types';

// Default impl writes through the same AgentStudioService the rest of the
// section uses, so the localStorage mock and the (eventual) wpcom impl share
// one API. The engine never touches localStorage directly.
export const defaultStorageService: StorageService = {
	async saveGenerationResult( {
		outputId,
		covers,
		bodyPages,
		selectedCoverIdx,
		notes,
		brandPackSlug,
		input,
		usage,
		previewUrls,
	} ) {
		await agentStudioService.updateOutput( outputId, {
			status: 'ready',
			previewUrls,
			assetCount: bodyPages.length + 1,
			onePagerData: {
				covers: covers.map( ( page ) => ( {
					id: `${ page.coverLayoutId ?? 'cover' }__${ page.theme ?? 'light' }`,
					layoutId: page.coverLayoutId ?? 'cover',
					theme: page.theme ?? 'light',
					html: page.html,
				} ) ),
				bodyPages: bodyPages.map( ( page ) => page.html ),
				selectedCoverIdx,
				notes,
				brandPackSlug,
				input,
				usage,
			},
		} );
	},
	async markGenerationFailed( { outputId, error } ) {
		await agentStudioService.updateOutput( outputId, {
			status: 'failed',
			errorMessage: error,
		} );
	},
	async getDefaults() {
		return agentStudioService.getOnePagerDefaults();
	},
	async setDefaults( defaults ) {
		await agentStudioService.setOnePagerDefaults( defaults );
	},
};
