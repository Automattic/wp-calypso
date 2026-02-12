import {
	Button,
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	isFetchingPreferences,
	isSavingPreference,
	preferencesLastSaveError,
} from 'calypso/state/preferences/selectors';
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
	const hasOptedOut = savedPreference?.value === 'opt-out';

	const isFetching = useSelector( isFetchingPreferences );
	const isSaving = useSelector( isSavingPreference );
	const lastSaveError = useSelector( preferencesLastSaveError );

	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const handleClick = async () => {
		if ( hasOptedIn ) {
			window.location.href = dashboardLink();
			return;
		}

		setIsSubmitting( true );

		dispatch( recordTracksEvent( 'calypso_hosting_dashboard_opt_in_banner_click' ) );

		const preference = {
			value: 'opt-in',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		await dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );

		if ( lastSaveError ) {
			setIsSubmitting( false );
			dispatch(
				errorNotice( translate( 'Failed to save preference.' ), {
					duration: 5000,
				} )
			);
		} else {
			window.location.href = dashboardLink();
		}
	};

	// Can not use the usual TrackComponentView component because `isFetching` is momentarily `false`
	// when the component first mounts, and we do not know whether the it will start fetching or not.
	// We add a delay before recording the impression to leave some time for `isFetching` to become `true`.
	useEffect( () => {
		const timeout = setTimeout( () => {
			if ( ! isFetching && ! hasOptedIn ) {
				dispatch( recordTracksEvent( 'calypso_hosting_dashboard_opt_in_banner_impression' ) );
			}
		}, 100 );
		return () => clearTimeout( timeout );
	}, [ isFetching, hasOptedIn, dispatch ] );

	if ( isFetching || hasOptedOut ) {
		return null;
	}

	const heading = (
		<Text as="p" weight={ 500 } size={ isMobile ? 12 : 13 }>
			{ hasOptedIn && ! isSubmitting
				? translate( 'Looking for your new dashboard?' )
				: translate( 'Your dashboard, simplified' ) }
		</Text>
	);

	const description = (
		<Text as="p" variant="muted" size={ isMobile ? 12 : 13 }>
			{ translate( 'Try an easier way to manage your sites and hosting features.' ) }
		</Text>
	);

	const button = (
		<Button
			variant="secondary"
			size={ isMobile ? 'compact' : undefined }
			isBusy={ isSubmitting && isSaving }
			onClick={ handleClick }
		>
			{ hasOptedIn && ! isSubmitting
				? translate( 'Go to new dashboard' )
				: translate( 'Try it out' ) }
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
