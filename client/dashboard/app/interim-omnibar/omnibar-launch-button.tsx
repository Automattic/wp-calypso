/* eslint-disable no-restricted-imports */
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import clsx from 'clsx';
import Item from 'calypso/layout/masterbar/item';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteLaunch } from '../../sites/site-launch-button/use-site-launch';
import { dashboardLinkWithBackport } from '../../utils/link';
import type { Site } from '@automattic/api-core';

const LaunchRocketIcon = () => (
	<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10.6242 9.74354L7.62419 12.1261V13.2995C7.62419 13.4418 7.77653 13.5322 7.90147 13.4641L10.5265 12.0322C10.5867 11.9994 10.6242 11.9363 10.6242 11.8676V9.74354ZM6.49919 12.0875L3.91203 9.50037H2.7001C1.70383 9.50037 1.07079 8.43399 1.54786 7.55937L2.97968 4.93437C3.20967 4.51272 3.65161 4.25036 4.13191 4.25036H7.17569C9.1325 2.16798 11.3176 0.754637 14.1427 0.531305C14.9004 0.471402 15.5282 1.09911 15.4682 1.85687C15.2449 4.68199 13.8316 6.86706 11.7492 8.82386V11.8676C11.7492 12.3479 11.4868 12.7899 11.0652 13.0199L8.44018 14.4517C7.56557 14.9288 6.49919 14.2957 6.49919 13.2995V12.0875ZM6.25602 5.37536H4.13191C4.0633 5.37536 4.00017 5.41284 3.96731 5.47308L2.53549 8.09808C2.46734 8.22303 2.55777 8.37536 2.7001 8.37536H3.87344L6.25602 5.37536Z"
		/>
		<path d="M0.498047 13.3962C0.498047 12.2341 1.44011 11.2921 2.60221 11.2921C3.76431 11.2921 4.70638 12.2341 4.70638 13.3962C4.70638 14.5583 3.76431 15.5004 2.60221 15.5004H1.06055C0.749887 15.5004 0.498047 15.2486 0.498047 14.9379V13.3962Z" />
	</svg>
);

export function OmnibarLaunchButton( { site }: { site: Site } ) {
	const siteOverviewUrl = `/sites/${ site.slug }`;
	const { createErrorNotice } = useDispatch( noticesStore );
	const { isLoading, isExperimentLoading, isHidden, isDisabled, isBusy, href, onClick, modal } =
		useSiteLaunch( site, {
			tracksContext: 'interim_omnibar',
			backTo: siteOverviewUrl,
			postLaunchUrl: dashboardLinkWithBackport( siteOverviewUrl ),
			recordTracksEvent,
			onLaunchError: () => {
				createErrorNotice( __( 'Failed to launch site.' ), { type: 'snackbar' } );
			},
		} );

	if ( isHidden ) {
		return null;
	}

	return (
		<>
			<Item
				as={ Button }
				asProps={ {
					variant: 'primary',
					isBusy,
					href,
				} }
				disabled={ isLoading || isExperimentLoading || isDisabled || isBusy }
				// Keep the Launch button always in blueberry (default scheme: modern) like in wp-admin.
				className={ clsx( 'masterbar__item-launch-site', 'color-scheme', 'is-global' ) }
				icon={ <LaunchRocketIcon /> }
				onClick={ onClick }
			>
				{ __( 'Launch site' ) }
			</Item>
			{ modal }
		</>
	);
}
