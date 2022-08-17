// import { Button } from '@automattic/components';
// import { createInterpolateElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { showDSP } from 'calypso/lib/promote-post';

interface Props {
	goNext: () => void;
	flowName: string | null;
}

const Promote: React.FC< Props > = () => {
	const siteIdParam = useSiteIdParam();
	const { setStepProgress } = useDispatch( ONBOARD_STORE );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		( async () => {
			if ( siteIdParam === null ) {
				return;
			}
			await showDSP( siteIdParam, 200 );
			setIsLoading( false );
			setStepProgress( { count: 4, progress: 1 } );
		} )();
	}, [] );

	return (
		<div className="promote__content">
			{ isLoading && <LoadingEllipsis /> }
			<div id="promote__widget-container"></div>
		</div>
	);
};

export default Promote;
