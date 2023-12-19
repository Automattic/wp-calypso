import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import AddNewSiteButton from 'calypso/components/jetpack/add-new-site-button';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import WPCOMHostingPopover from './wpcom-hosting-popover';

export default function SiteTopHeaderButtons() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	const partner = useSelector( getCurrentPartner );

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	const buttonRef = useRef< HTMLElement | null >( null );
	const [ toggleIsOpen, setToggleIsOpen ] = useState( false );

	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_issue_license_button_click' ) );
	};

	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderAddSitesTour = urlParams.get( 'tour' ) === 'add-new-site';

	return (
		<div
			className={ classNames( 'sites-overview__add-site-issue-license-buttons', {
				'is-with-split-button': isWPCOMAtomicSiteCreationEnabled,
			} ) }
		>
			<Button
				href={ partnerCanIssueLicense ? '/partner-portal/issue-license' : undefined }
				className="sites-overview__issue-license-button"
				disabled={ ! partnerCanIssueLicense }
				onClick={ onIssueNewLicenseClick }
			>
				{ translate( 'Issue License', { context: 'button label' } ) }
			</Button>

			{ isWPCOMAtomicSiteCreationEnabled ? (
				<span id="sites-overview-add-sites-button">
					<AddNewSiteButton
						showMainButtonLabel={ ! isMobile }
						popoverContext={ buttonRef }
						onToggleMenu={ ( isOpen: boolean ) => setToggleIsOpen( isOpen ) }
						onClickAddNewSite={ () =>
							dispatch(
								recordTracksEvent(
									'calypso_jetpack_agency_dashboard_sites_overview_add_new_site_click'
								)
							)
						}
						onClickWpcomMenuItem={ () =>
							dispatch(
								recordTracksEvent(
									'calypso_jetpack_agency_dashboard_sites_overview_create_wpcom_site_click'
								)
							)
						}
						onClickJetpackMenuItem={ () =>
							dispatch(
								recordTracksEvent(
									'calypso_jetpack_agency_dashboard_sites_overview_connect_jetpack_site_click'
								)
							)
						}
					/>
					{ shouldRenderAddSitesTour && (
						<GuidedTour
							className="jetpack-cloud-site-dashboard__guided-tour"
							preferenceName="jetpack-cloud-site-dashboard-add-new-site-tour"
							tours={ [
								{
									target: '#sites-overview-add-sites-button .split-button__toggle',
									popoverPosition: 'bottom left',
									title: translate( 'Press on an arrow button' ),
									description: translate(
										'Click the arrow button and select "Connect a site to Jetpack". ' +
											'Sites with jetpack installed will automatically appear in the site management view.'
									),
									nextStepOnTargetClick: '#sites-overview-add-sites-button .split-button__toggle',
								},
							] }
						/>
					) }
					<WPCOMHostingPopover
						context={ buttonRef.current }
						// Show the popover only when the split button is closed
						isVisible={ ! toggleIsOpen }
					/>
				</span>
			) : (
				<Button
					primary
					className="sites-overview__issue-license-button"
					href="https://wordpress.com/jetpack/connect"
					onClick={ () =>
						dispatch(
							recordTracksEvent( 'calypso_jetpack_agency_dashboard_add_site_button_click' )
						)
					}
				>
					{ translate( 'Add New Site', { context: 'button label' } ) }
				</Button>
			) }
		</div>
	);
}
