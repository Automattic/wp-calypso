import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import type { UserData } from 'calypso/lib/user/user';

import './style.scss';

export default function OnboardingWidget( { isLicensesPage }: { isLicensesPage?: boolean } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isIframeLoaded, setIsIframeLoaded ] = useState( false );

	const user = useSelector( getCurrentUser ) as UserData;
	const sites = useSelector( getSites );

	const onIssueNewLicenseClick = () => {
		dispatch(
			recordTracksEvent(
				isLicensesPage
					? 'calypso_partner_portal_empty_state_issue_license_click'
					: 'calypso_jetpack_agency_dashboard_empty_state_issue_license_click'
			)
		);
	};

	const onHowToAddNewSiteClick = () => {
		dispatch(
			recordTracksEvent(
				isLicensesPage
					? 'calypso_partner_portal_empty_state_how_to_add_site_click'
					: 'calypso_jetpack_agency_dashboard_empty_state_how_to_add_site_click'
			)
		);
	};

	const hasSites = sites && sites.length > 0;

	const steps = [
		{
			stepCount: hasSites ? <Gridicon icon="checkmark" size={ 16 } /> : 1,
			title: translate( 'Add your Jetpack sites' ),
			description: translate(
				'Add your clients’ sites to your dashboard to manage features and monitor them. To add your sites to the Pro Dashboard, simply connect them to Jetpack using the same {{strong}}%(displayName)s{{/strong}} user account.',
				{
					args: { displayName: user?.display_name },
					components: {
						strong: <strong />,
					},
				}
			),
			video:
				'https://video.wordpress.com/embed/T6pTlPK8?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1',
			extraContent: (
				<Button
					target="_blank"
					borderless
					href="https://jetpack.com/support/jetpack-agency-licensing-portal-instructions/add-sites-agency-portal-dashboard/"
					onClick={ onHowToAddNewSiteClick }
				>
					{ translate( 'How to add sites to the dashboard' ) } &nbsp;
					<Gridicon icon="external" size={ 24 } />
				</Button>
			),
			isCompleted: hasSites,
		},
		{
			stepCount: 2,
			title: translate( 'Issue product licenses' ),
			description: translate(
				'Add your first license and get up to a 60% discount on Jetpack products. Licenses can be revoked at any time, giving you the flexibility to add or remove products when it’s most convenient, meaning you only pay when you use them.'
			),
			video:
				'https://video.wordpress.com/embed/nsqG1pBO?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1',
			extraContent: (
				<Button
					href="/partner-portal/issue-license"
					onClick={ onIssueNewLicenseClick }
					primary
					style={ { marginLeft: 'auto' } }
				>
					{ translate( 'Issue New License' ) }
				</Button>
			),
		},
	];

	const completedStep = (
		<span className="onboarding-widget__step-completed">{ translate( 'Completed' ) }</span>
	);

	return (
		<div
			className={ classNames( 'onboarding-widget__empty-list', {
				'is-licenses-page': isLicensesPage,
			} ) }
		>
			<h2 className="onboarding-widget__title">
				{ translate( "Let's get started with the Jetpack Pro Dashboard" ) }
			</h2>

			<div className="onboarding-widget__steps">
				{ steps.map( ( step, index ) => (
					<div className="onboarding-widget__step" key={ index }>
						<div className="onboarding-widget__step-heading">
							<span className="onboarding-widget__step-ellipse">{ step.stepCount }</span>
							<span className="onboarding-widget__step-title">{ step.title }</span>
							{ step.isCompleted && completedStep }
						</div>
						<div className="onboarding-widget__mobile-view">
							{ step.isCompleted && completedStep }
						</div>
						<div
							className={ classNames( 'onboarding-widget__video', {
								'is-loading-iframe': ! isIframeLoaded,
							} ) }
						>
							<iframe
								title="VideoPress Video Player"
								aria-label="VideoPress Video Player"
								src={ step.video }
								allowFullScreen
								onLoad={ () => setIsIframeLoaded( true ) }
							></iframe>
						</div>
						<p className="onboarding-widget__step-description">{ step.description }</p>
						{ step.extraContent }
					</div>
				) ) }
			</div>
		</div>
	);
}
