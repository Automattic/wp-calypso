import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import AddNewSiteButton from 'calypso/a8c-for-agencies/components/add-new-site-button';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
// import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
// import WPCOMHostingPopover from './wpcom-hosting-popover';

import './style.scss';

/** @todo Do we need the WPCOM Hosting Popover? */
/** @todo Do we need to implement the partnerCanIssueLicense check? */
export default function SiteTopHeaderButtons() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	// const partner = useSelector( getCurrentPartner );

	const buttonRef = useRef< HTMLElement | null >( null );
	const [ toggleIsOpen, setToggleIsOpen ] = useState( false );

	// const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

	// const onIssueNewLicenseClick = () => {
	// 	dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_issue_license_button_click' ) );
	// };

	return (
		<div className="sites-overview__top-header-buttons">
			{ /* <Button
				href={ partnerCanIssueLicense ? '/partner-portal/issue-license' : undefined }
				className="sites-overview__issue-license-button"
				disabled={ ! partnerCanIssueLicense }
				onClick={ onIssueNewLicenseClick }
			>
				{ translate( 'Issue License', { context: 'button label' } ) }
			</Button> */ }

			<span id="sites-overview-add-sites-button">
				<AddNewSiteButton
					showMainButtonLabel={ ! isMobile }
					// popoverContext={ buttonRef }
					// onToggleMenu={ ( isOpen: boolean ) => setToggleIsOpen( isOpen ) }
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
					onClickUrlMenuItem={ () =>
						dispatch(
							recordTracksEvent(
								'calypso_jetpack_agency_dashboard_sites_overview_connect_url_site_click'
							)
						)
					}
				/>

				{ /* <WPCOMHostingPopover
                    context={ buttonRef.current }
                    // Show the popover only when the split button is closed
                    isVisible={ ! toggleIsOpen }
                /> */ }
			</span>
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
