import { activateJetpackModule, deactivateJetpackModule } from '../../data/site-jetpack-modules';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';

export const siteJetpackModuleMutation = ( siteId: number ) => ( {
	mutationFn: ( data: { module: string; value: boolean } ) => {
		const { module, value } = data;
		return value
			? activateJetpackModule( siteId, module )
			: deactivateJetpackModule( siteId, module );
	},
	onSuccess: () => {
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	},
} );
