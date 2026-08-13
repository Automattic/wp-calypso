import { Button, Card } from '@automattic/components';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import { openStudioCheckoutReturn } from './deep-link';
import type { FunctionComponent } from 'react';

import './style.scss';

interface StudioReturnProps {
	studioSiteId: string;
	studioReturnTo?: string;
}

const StudioReturn: FunctionComponent< StudioReturnProps > = ( {
	studioSiteId,
	studioReturnTo,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const openStudio = useCallback(
		( click: boolean ) => {
			dispatch(
				recordTracksEvent( 'calypso_studio_checkout_return', {
					checkout_result: 'cancelled',
					click,
					studio_site_id: studioSiteId,
					studio_return_to: studioReturnTo,
				} )
			);
			openStudioCheckoutReturn( {
				studioSiteId,
				checkoutResult: 'cancelled',
				studioReturnTo,
			} );
		},
		[ dispatch, studioSiteId, studioReturnTo ]
	);

	const hasAttemptedHandoff = useRef( false );
	useEffect( () => {
		if ( hasAttemptedHandoff.current ) {
			return;
		}
		hasAttemptedHandoff.current = true;
		openStudio( false );
	}, [ openStudio ] );

	// This route runs in the checkout section, where the masterbar renders a close button that would
	// drop the user on the plans page. The page exists to send them back to Studio, so hide it.
	useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	return (
		<Main className="studio-return">
			<PageViewTracker path="/checkout/studio-return" title="Checkout > Studio Return" />

			<Card>
				<VStack spacing={ 4 } alignment="center">
					<h1>{ translate( 'Checkout cancelled' ) }</h1>

					<p>
						{ translate( 'You haven’t been charged. Return to WordPress Studio to keep working.' ) }
					</p>

					<Button primary onClick={ () => openStudio( true ) }>
						{ translate( 'Open Studio' ) }
					</Button>

					<a href="/sites">{ translate( 'Go to WordPress.com' ) }</a>
				</VStack>
			</Card>
		</Main>
	);
};

export default StudioReturn;
