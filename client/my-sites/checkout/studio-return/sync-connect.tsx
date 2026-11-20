import {
	Button,
	Card,
	CardBody,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef } from 'react';
import QuerySites from 'calypso/components/data/query-sites';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import { openStudioSyncConnect } from './deep-link';
import type { StudioSyncConnectParams } from './round-trip';
import type { FunctionComponent } from 'react';

import './style.scss';

/**
 * Where Studio's publish flow lands once the new site is ready: asks the browser to open Studio so
 * it connects the local site to the new one.
 *
 * The page stays put after the automatic open. Navigating away while the browser asks whether to
 * open Studio dismisses that prompt in Chrome, so the user moves on with the Dashboard link.
 */
const StudioSyncConnect: FunctionComponent< StudioSyncConnectParams > = ( {
	studioSiteId,
	remoteSiteId,
	autoOpenPush,
} ) => {
	const dispatch = useDispatch();
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, remoteSiteId, 'index.php' ) );

	const openStudio = useCallback(
		( { fromUserClick }: { fromUserClick: boolean } ) => {
			// Same event My Home sent, so the handoff rate stays comparable across the move.
			recordTracksEvent( 'calypso_studio_sync_connect_site', {
				click: fromUserClick,
				blog_id: remoteSiteId,
				studio_site_id: studioSiteId,
				source: 'studio_return_page',
				auto_open_push: autoOpenPush,
				visibility: document.visibilityState === 'hidden' ? 'hidden' : 'visible',
			} );
			openStudioSyncConnect( { studioSiteId, remoteSiteId, autoOpenPush } );
		},
		[ studioSiteId, remoteSiteId, autoOpenPush ]
	);

	const hasAttemptedHandoff = useRef( false );
	useEffect( () => {
		if ( hasAttemptedHandoff.current ) {
			return;
		}
		hasAttemptedHandoff.current = true;
		openStudio( { fromUserClick: false } );
	}, [ openStudio ] );

	// This route runs in the checkout section, where the masterbar renders a close button that would
	// drop the user on the plans page.
	useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	return (
		<Main className="studio-return">
			<PageViewTracker
				path="/checkout/studio-return/sync-connect-site"
				title="Checkout > Studio Sync Connect"
			/>
			<QuerySites siteId={ remoteSiteId } />

			<Card>
				<CardBody>
					<VStack spacing={ 4 } alignment="center">
						<Heading level={ 1 }>{ __( 'Your site is ready' ) }</Heading>

						<Text as="p">
							{ autoOpenPush
								? __(
										'If WordPress Studio didn’t open, open it to connect your local site to this one and push your changes.'
									)
								: __(
										'If WordPress Studio didn’t open, open it to connect your local site to this one.'
									) }
						</Text>

						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => openStudio( { fromUserClick: true } ) }
						>
							{ __( 'Open Studio' ) }
						</Button>

						<a href={ adminUrl || '/sites' }>{ __( 'Go to your site’s dashboard' ) }</a>
					</VStack>
				</CardBody>
			</Card>
		</Main>
	);
};

export default StudioSyncConnect;
