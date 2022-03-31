import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useSite } from './use-site';

type Response = {
	is_fse_eligible: boolean;
	is_fse_active: boolean;
};

export function useFSEStatus() {
	const site = useSite();
	const [ FSEEligible, setFSEEligible ] = React.useState< boolean >( false );
	const [ FSEActive, setFSEActive ] = React.useState< boolean >( false );
	const [ isLoading, setIsLoading ] = React.useState< boolean >( true );

	React.useEffect( () => {
		if ( site ) {
			wpcom.req
				.get( {
					path: `/sites/${ site.ID }/block-editor`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( { is_fse_eligible, is_fse_active }: Response ) => {
					setFSEEligible( is_fse_eligible );
					setFSEActive( is_fse_active );
					setIsLoading( false );
				} );
		}
	}, [ site ] );

	return { FSEEligible, FSEActive, isLoading };
}
