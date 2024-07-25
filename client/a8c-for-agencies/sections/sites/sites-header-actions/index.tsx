import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

type Props = {
	onWPCOMImport?: ( blogIds: number[] ) => void;
};

export default function SitesHeaderActions( { onWPCOMImport }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const [ tourStepRef, setTourStepRef ] = useState< HTMLElement | null >( null );

	return (
		<div className="sites-header__actions">
			{ config.isEnabled( 'a4a-dev-sites' ) && (
				<AddNewSiteButton showMainButtonLabel={ ! isMobile } devSite />
			) }
			<div ref={ ( ref ) => setTourStepRef( ref ) }>
				<AddNewSiteButton showMainButtonLabel={ ! isMobile } onWPCOMImport={ onWPCOMImport } />
			</div>
			<GuidedTourStep id="add-new-site" tourId="addSiteStep1" context={ tourStepRef } />
			<Button
				primary
				href={ A4A_MARKETPLACE_PRODUCTS_LINK }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_a4a_sites_add_products_click' ) );
				} }
			>
				{ translate( 'Add products' ) }
			</Button>
		</div>
	);
}
