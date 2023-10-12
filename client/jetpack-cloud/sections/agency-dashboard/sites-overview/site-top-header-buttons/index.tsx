import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import AddNewSiteButton from 'calypso/components/jetpack/add-new-site-button';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import WPCOMHostingPopover from './wpcom-hosting-popover';

export default function SiteTopHeaderButtons() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	const buttonRef = useRef< HTMLElement | null >( null );
	const [ toggleIsOpen, setToggleIsOpen ] = useState( false );

	const handleNewLandingPage = async () => {
		const response = await wpcomJpl.req.post( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/create-simple-site',
		} );

		const { siteurl } = response;
		const editorPageUrl = `${ decodeURI(
			siteurl
		) }/wp-admin/site-editor.php?postType=wp_template&postId=${ encodeURIComponent(
			'pub/twentytwentythree//home'
		) }&canvas=edit`;
		window.location = editorPageUrl;
	};

	return (
		<div
			className={ classNames( 'sites-overview__add-site-issue-license-buttons', {
				'is-with-split-button': isWPCOMAtomicSiteCreationEnabled,
			} ) }
		>
			<Button
				className="sites-overview__issue-license-button"
				href="/partner-portal/issue-license"
				onClick={ () =>
					dispatch(
						recordTracksEvent( 'calypso_jetpack_agency_dashboard_issue_license_button_click' )
					)
				}
			>
				{ translate( 'Issue License', { context: 'button label' } ) }
			</Button>

			<Button className="sites-overview__issue-license-button" onClick={ handleNewLandingPage }>
				{ translate( 'New landing page' ) }
			</Button>

			{ isWPCOMAtomicSiteCreationEnabled ? (
				<span>
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
