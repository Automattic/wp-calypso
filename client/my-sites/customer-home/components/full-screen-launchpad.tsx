import { CircularProgressBar } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { useCelebrateLaunchModal } from '../cards/launchpad/use-celebrate-launch-modal';
import { useLaunchpad } from '../cards/launchpad/use-launchpad';
import CelebrateLaunchModal from './celebrate-launch-modal';

import './full-screen-launchpad.scss';

export const FullScreenLaunchpad = ( { onClose }: { onClose: () => void } ) => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';

	const launchpadContext = 'customer-home';

	const { siteSlug, isDismissed, numberOfSteps, completedSteps, launchpadTitle } = useLaunchpad( {
		checklistSlug,
		launchpadContext,
	} );

	const layout = useHomeLayoutQuery( siteId || null );
	const { isOpen, setModalIsOpen, handleSiteLaunched } = useCelebrateLaunchModal( siteId, layout );
	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const onSiteLaunched = () => {
		handleSiteLaunched( !! site?.is_wpcom_atomic );
	};

	if ( isDismissed ) {
		return null;
	}

	return (
		<div css={ { display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
			<div className="is-launchpad-first" css={ { width: '100%' } }>
				<div className="customer-home-launchpad customer-home__card is-small-hero">
					<div className="customer-home__launchpad-header">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							numberOfSteps={ numberOfSteps }
							currentStep={ completedSteps }
						/>
						<h2>{ __( 'Let’s get started!' ) }</h2>
						<span>{ launchpadTitle }</span>
					</div>
					<Launchpad
						siteSlug={ siteSlug }
						checklistSlug={ checklistSlug }
						launchpadContext={ launchpadContext }
						onSiteLaunched={ onSiteLaunched }
						highlightNextAction
					/>
					{ isOpen && (
						<CelebrateLaunchModal
							setModalIsOpen={ setModalIsOpen }
							site={ site }
							allDomains={ allDomains }
						/>
					) }
				</div>
			</div>
			<Button onClick={ onClose }>{ __( 'Skip onboarding setup' ) }</Button>
		</div>
	);
};
