import { siteLaunchMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useExperiment } from 'calypso/lib/explat';
import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

export const MasterbarLaunchButton = ( { siteId }: { siteId: number } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const sectionName = useSelector( getSectionName );
	const launchSiteMutation = useMutation( siteLaunchMutation( siteId ) );

	const { onSiteLaunched } = useCelebrateLaunchModalSideEffects( siteId );

	const [ isLoading, data ] = useExperiment( 'calypso_standardized_site_launch_gating' );

	const onLaunchSiteClick = () => {
		dispatch( recordTracksEvent( 'calypso_masterbar_launch_site', { source: sectionName } ) );

		if ( data?.variationName === 'gated_site_launch' ) {
			window.location.assign(
				addQueryArgs( '/start/launch-site', {
					siteSlug: site?.slug,
					back_to: window.location.pathname,
				} )
			);
			return;
		}

		if ( data?.variationName === 'ungated_site_launch' ) {
			launchSiteMutation.mutate( undefined, {
				onSuccess: () => onSiteLaunched( !! site?.is_wpcom_atomic ),
			} );
			return;
		}

		dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) );
	};

	return (
		<Item
			as={ Button }
			variant="primary"
			disabled={ isLoading || launchSiteMutation.isPending }
			isBusy={ launchSiteMutation.isPending }
			// Keep the Launch button always in blueberry (default scheme: modern) like in wp-admin.
			className={ clsx( 'masterbar__item-launch-site', 'color-scheme', 'is-global' ) }
			icon={
				<svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M10.6242 9.74354L7.62419 12.1261V13.2995C7.62419 13.4418 7.77653 13.5322 7.90147 13.4641L10.5265 12.0322C10.5867 11.9994 10.6242 11.9363 10.6242 11.8676V9.74354ZM6.49919 12.0875L3.91203 9.50037H2.7001C1.70383 9.50037 1.07079 8.43399 1.54786 7.55937L2.97968 4.93437C3.20967 4.51272 3.65161 4.25036 4.13191 4.25036H7.17569C9.1325 2.16798 11.3176 0.754637 14.1427 0.531305C14.9004 0.471402 15.5282 1.09911 15.4682 1.85687C15.2449 4.68199 13.8316 6.86706 11.7492 8.82386V11.8676C11.7492 12.3479 11.4868 12.7899 11.0652 13.0199L8.44018 14.4517C7.56557 14.9288 6.49919 14.2957 6.49919 13.2995V12.0875ZM6.25602 5.37536H4.13191C4.0633 5.37536 4.00017 5.41284 3.96731 5.47308L2.53549 8.09808C2.46734 8.22303 2.55777 8.37536 2.7001 8.37536H3.87344L6.25602 5.37536Z"
					/>
					<path d="M0.498047 13.3962C0.498047 12.2341 1.44011 11.2921 2.60221 11.2921C3.76431 11.2921 4.70638 12.2341 4.70638 13.3962C4.70638 14.5583 3.76431 15.5004 2.60221 15.5004H1.06055C0.749887 15.5004 0.498047 15.2486 0.498047 14.9379V13.3962Z" />
				</svg>
			}
			onClick={ onLaunchSiteClick }
		>
			{ translate( 'Launch site' ) }
		</Item>
	);
};
