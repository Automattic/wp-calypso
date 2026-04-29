import { siteLaunchMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalItem as Item,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { border, chevronRight } from '@wordpress/icons';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { useExperiment } from 'calypso/lib/explat';
import { useCelebrateLaunchModal } from 'calypso/my-sites/customer-home/cards/launchpad/use-celebrate-launch-modal';
import CelebrateLaunchModal from 'calypso/my-sites/customer-home/components/celebrate-launch-modal';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'calypso/state/sites/launch/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
	itemClassName: string;
};

/**
 * Launchpad row that triggers the same launch flow as the (now-removed)
 * masterbar Launch button — explat-gated mutate-or-redirect, plus the
 * celebrate-launch modal on success.
 */
export default function LaunchTaskItem( { task, itemClassName }: Props ) {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const site = useSelector( ( state: AppState ) => ( siteId ? getSite( state, siteId ) : null ) );
	const { data: allDomains = [], isFetchedAfterMount } = useGetDomainsQuery( siteId, {
		retry: false,
	} );
	const layout = useHomeLayoutQuery( siteId ?? 0 );
	const { isOpen, setModalIsOpen, handleSiteLaunched } = useCelebrateLaunchModal(
		siteId ?? 0,
		layout
	);

	const launchSiteMutation = useMutation( {
		...siteLaunchMutation( siteId ?? 0 ),
		onSuccess: () => handleSiteLaunched( !! site?.is_wpcom_atomic ),
	} );

	const [ isLoading, data ] = useExperiment( 'calypso_standardized_site_launch_gating' );
	const disabled = ! siteId || isLoading || launchSiteMutation.isPending;

	const onClick = () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( recordTracksEvent( 'calypso_launchpad_launch_site' ) );

		if ( data?.variationName === 'gated_site_launch' ) {
			window.location.assign( `/start/launch-site?siteSlug=${ site?.slug }` );
			return;
		}
		if ( data?.variationName === 'ungated_site_launch' ) {
			launchSiteMutation.mutate();
			return;
		}
		dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) );
	};

	return (
		<>
			<Item
				as="button"
				type="button"
				onClick={ onClick }
				disabled={ disabled }
				className={ itemClassName + ' tailored-launchpad__row' }
				aria-label={ task.title }
			>
				<HStack alignment="center" spacing={ 3 }>
					<span className="tailored-launchpad__check" aria-hidden="true">
						<Icon icon={ border } size={ 24 } />
					</span>
					<VStack spacing={ 0 } className="tailored-launchpad__body">
						<span className="tailored-launchpad__title">{ task.title }</span>
						{ task.subtitle && (
							<Text variant="muted" size={ 12 }>
								{ task.subtitle }
							</Text>
						) }
					</VStack>
					<Spacer />
					<span className="tailored-launchpad__chevron" aria-hidden="true">
						<Icon icon={ chevronRight } size={ 20 } />
					</span>
				</HStack>
			</Item>
			{ isOpen && isFetchedAfterMount && site && (
				<CelebrateLaunchModal
					setModalIsOpen={ setModalIsOpen }
					site={ site }
					allDomains={ allDomains }
				/>
			) }
		</>
	);
}
