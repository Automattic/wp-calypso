import { HelpCenter as HelpCenterStore } from '@automattic/data-stores'; // eslint-disable-line no-restricted-imports
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { help } from '@wordpress/icons';
import { Suspense, lazy, useCallback } from 'react';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite'; // eslint-disable-line no-restricted-imports
import { onboardingUrl } from 'calypso/lib/paths'; // eslint-disable-line no-restricted-imports
import { useAuth } from '../auth';
import type { HelpCenterSelect } from '@automattic/data-stores'; // eslint-disable-line no-restricted-imports

const HELP_CENTER_STORE = HelpCenterStore.register();

const AsyncHelpCenter = lazy(
	() => import( /* webpackChunkName: "async-help-center" */ '@automattic/help-center' )
);

const HelpCenter = () => {
	const { user } = useAuth();
	const show = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const currentUser = {
		...user,
		localeSlug: user.language,
		localeVariant: user.locale_variant,
	};

	const toggleHelpCenter = useCallback( () => {
		setShowHelpCenter( ! show );
	}, [ show, setShowHelpCenter ] );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	return (
		<>
			<Button
				className="dashboard-secondary-menu__item"
				label={ __( 'Help' ) }
				onClick={ toggleHelpCenter }
				icon={ help }
				variant="tertiary"
			/>
			<Suspense fallback={ null }>
				<AsyncHelpCenter
					locale={ user.language }
					sectionName="dashboard"
					currentUser={ currentUser }
					site={ null }
					hasPurchases={ false }
					primarySiteId={ 0 }
					onboardingUrl={ onboardingUrl() }
					googleMailServiceFamily={ getGoogleMailServiceFamily() }
					canConnectToZendesk={ false }
					handleClose={ handleClose }
				/>
			</Suspense>
		</>
	);
};

export default HelpCenter;
