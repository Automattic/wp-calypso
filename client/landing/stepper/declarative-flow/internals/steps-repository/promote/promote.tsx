// import { Button } from '@automattic/components';
// import { createInterpolateElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { usePostIdParam } from 'calypso/landing/stepper/hooks/use-post-id-param';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { showDSP } from 'calypso/lib/promote-post';

interface Props {
	goNext: () => void;
	flowName: string | null;
}

const Promote: React.FC< Props > = () => {
	const siteIdParam = useSiteIdParam();
	const postIdParam = usePostIdParam();
	const { setStepProgress } = useDispatch( ONBOARD_STORE );
	const [ isLoading, setIsLoading ] = useState( true );
	const widgetWrapperId = 'promote__widget-container';

	useEffect( () => {
		( async () => {
			if ( siteIdParam === null || postIdParam === null ) {
				return;
			}
			await showDSP( siteIdParam, postIdParam, widgetWrapperId );
			setIsLoading( false );
			setStepProgress( { count: 4, progress: 1 } );
		} )();
	}, [] );

	return (
		<div className="promote__content">
			{ isLoading && <LoadingEllipsis /> }
			<div id={ widgetWrapperId }></div>
		</div>
	);
};

export default Promote;
