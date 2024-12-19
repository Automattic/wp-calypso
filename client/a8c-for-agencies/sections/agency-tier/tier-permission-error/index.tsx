import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import AgencyTierLevels from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-levels.svg';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/multi-sites-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getTierPermissionData from '../lib/get-tier-permission-data';

import './style.scss';

export default function TierPermissionError( { section }: { section: string } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { title, content } = getTierPermissionData( section, translate );

	// Record the view event
	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_agency_tier_permission_error_view', { section } ) );
	}, [ dispatch, section ] );

	return (
		<Layout className="agency-tier-permission-error__layout" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="agency-tier-permission-error__content">
					<div className="agency-tier-permission-error__content-image">
						<img
							className="agency-tier-permission-error__content-image"
							alt="agency-tier-levels"
							src={ AgencyTierLevels }
						/>
					</div>
					<div className="agency-tier-permission-error__content-text">
						<div className="agency-tier-permission-error__content-heading">{ content.heading }</div>
						<div className="agency-tier-permission-error__content-description">
							{ content.description }
						</div>
						<Button
							href={ content.buttonProps.href }
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_agency_tier_permission_error_button_click', {
										section,
									} )
								);
							} }
							variant="primary"
						>
							{ content.buttonProps.text }
						</Button>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
