import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useSite } from './use-site';

export function useIsFSEEligible() {
	const site = useSite();
	const [ FSEEligible, setFSEEligible ] = React.useState< boolean >( false );
	const [ isLoading, setIsLoading ] = React.useState< boolean >( true );

	React.useEffect( () => {
		if ( site ) {
			wpcom.req
				.get( {
					path: `/sites/${ site.ID }/block-editor`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( { is_fse_eligible }: { is_fse_eligible: boolean } ) => {
					setFSEEligible( is_fse_eligible );
					setIsLoading( false );
				} );
		}
	}, [ site ] );

	return { FSEEligible, isLoading };
}
