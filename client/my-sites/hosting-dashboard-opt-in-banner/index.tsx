import config from '@automattic/calypso-config';
import {
	Button,
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPreference, isFetchingPreferences } from 'calypso/state/preferences/selectors';
import illustratioUrl from './illustration.svg';
import type { HostingDashboardOptIn } from '@automattic/api-core';

export default function HostingDashboardOptInBanner( {
	isMobile = false,
}: {
	isMobile?: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const savedPreference = useSelector(
		( state ) => getPreference( state, 'hosting-dashboard-opt-in' ) as HostingDashboardOptIn | null
	);
	const hasOptedIn = savedPreference?.value === 'opt-in';

	const isFetching = useSelector( isFetchingPreferences );

	const isEnabled = config.isEnabled( 'dashboard/rollout-advance-notice' );

	const handleClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_dashboard_advance_notice_banner_click' ) );
	};

	// Can not use the usual TrackComponentView component because `isFetching` is momentarily `false`
	// when the component first mounts, and we do not know whether the it will start fetching or not.
	// We add a delay before recording the impression to leave some time for `isFetching` to become `true`.
	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}
		const timeout = setTimeout( () => {
			if ( ! isFetching && ! hasOptedIn ) {
				dispatch(
					recordTracksEvent( 'calypso_hosting_dashboard_advance_notice_banner_impression' )
				);
			}
		}, 100 );
		return () => clearTimeout( timeout );
	}, [ isEnabled, isFetching, hasOptedIn, dispatch ] );

	if ( ! isEnabled || isFetching ) {
		return null;
	}

	const heading = (
		<Text as="p" weight={ 500 } size={ isMobile ? 12 : 13 }>
			{ hasOptedIn
				? translate( 'The new dashboard is here to stay' )
				: translate( 'A new dashboard is on the way' ) }
		</Text>
	);

	const description = (
		<Text as="p" variant="muted" size={ isMobile ? 12 : 13 }>
			{ hasOptedIn
				? translate(
						'Soon, the Hosting Dashboard you’ve been using becomes the default for everyone, and this classic view will be retired. Your content and settings stay the same.'
				  )
				: translate(
						'Soon, navigation in the Hosting Dashboard is changing to be more consistent with WordPress Admin and easier to get around. Your content and settings stay exactly as they are. Can’t wait?'
				  ) }
		</Text>
	);

	const button = (
		<Button
			variant="secondary"
			size={ isMobile ? 'compact' : undefined }
			href={ hasOptedIn ? dashboardLink() : '/me/account#hosting-dashboard-opt-in' }
			onClick={ handleClick }
		>
			{ hasOptedIn ? translate( 'Go to new dashboard' ) : translate( 'Try it now' ) }
		</Button>
	);

	return (
		<Card style={ { width: '100%' } }>
			<CardBody style={ { padding: '12px' } }>
				{ isMobile ? (
					<VStack spacing={ 2 } alignment="flex-start">
						<VStack spacing={ 0 }>
							{ heading }
							{ description }
						</VStack>
						{ button }
					</VStack>
				) : (
					<VStack spacing={ 3 }>
						<img src={ illustratioUrl } alt="illustration" />
						<VStack spacing={ 1 }>
							{ heading }
							{ description }
						</VStack>
						<HStack expanded={ false }>{ button }</HStack>
					</VStack>
				) }
			</CardBody>
		</Card>
	);
}
