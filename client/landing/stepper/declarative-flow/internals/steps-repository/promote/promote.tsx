// import { Button } from '@automattic/components';
// import { createInterpolateElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { showDSPWidgetModal } from 'calypso/lib/promote-post';

interface Props {
	goNext: () => void;
	flowName: string | null;
}

const Promote: React.FC< Props > = () => {
	const siteIdParam = useSiteIdParam();
	const { setStepProgress } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		( async () => {
			if ( siteIdParam === null ) {
				return;
			}
			await showDSPWidgetModal( siteIdParam );
			setStepProgress( { count: 4, progress: 3 } );
		} )();
	}, [] );

	useEffect( () => {
		setStepProgress( { count: 4, progress: 1 } );
	}, [] );
	return (
		<div className="promote__content">
			The widget is being rendered in the div below
			<div id="promote__widget-container"></div>
		</div>
	);
};

export default Promote;
