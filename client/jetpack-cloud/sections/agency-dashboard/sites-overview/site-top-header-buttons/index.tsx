import { isEnabled } from '@automattic/calypso-config';
import { Button, WordPressLogo } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function SiteTopHeaderButtons() {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

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

			{ ! isWPCOMAtomicSiteCreationEnabled && (
				<Button
					className="sites-overview__issue-license-button"
					primary
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

			{ isWPCOMAtomicSiteCreationEnabled && (
				<SplitButton
					primary
					whiteSeparator
					label={ isMobile ? undefined : translate( 'Add new site' ) }
					onClick={ () =>
						dispatch(
							recordTracksEvent(
								'calypso_jetpack_agency_dashboard_create_wpcom_atomic_site_button_click'
							)
						)
					}
					href="/partner-portal/create-site"
					toggleIcon={ isMobile ? 'plus' : undefined }
				>
					<PopoverMenuItem
						onClick={ () => {
							recordTracksEvent(
								'calypso_jetpack_agency_dashboard_create_wpcom_atomic_site_button_click'
							);
						} }
						href="/partner-portal/create-site"
					>
						<WordPressLogo className="gridicon" size={ 18 } />
						<span>{ translate( 'Create a new WordPress.com site' ) }</span>
					</PopoverMenuItem>

					<PopoverMenuItem
						onClick={ () =>
							dispatch(
								recordTracksEvent(
									'calypso_jetpack_agency_dashboard_connect_jetpack_site_button_click'
								)
							)
						}
						href="https://wordpress.com/jetpack/connect"
						isExternalLink
					>
						<JetpackLogo className="gridicon" size={ 18 } />
						<span>{ translate( 'Connect a site to Jetpack' ) }</span>
					</PopoverMenuItem>
				</SplitButton>
			) }
		</div>
	);
}
