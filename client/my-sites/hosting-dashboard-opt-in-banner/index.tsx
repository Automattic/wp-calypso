import {
	Button,
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
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

export default function HostingDashboardOptInBanner() {
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
			window.location.href = '/v2';
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
			window.location.href = '/v2';
		}
	};

	if ( isFetching || hasOptedOut ) {
		return null;
	}

	return (
		<>
			<TrackComponentView eventName="calypso_hosting_dashboard_opt_in_banner_impression" />
			<Card>
				<CardBody style={ { padding: '12px' } }>
					<VStack spacing={ 3 }>
						<img src={ illustratioUrl } alt="illustration" />
						<VStack spacing={ 1 }>
							<Text as="p" weight={ 500 }>
								{ hasOptedIn && ! isSubmitting
									? translate( 'Looking for your new dashboard?' )
									: translate( 'Your dashboard, simplified' ) }
							</Text>
							<Text as="p" variant="muted">
								{ translate( 'Try an easier way to manage your sites and hosting features.' ) }
							</Text>
						</VStack>
						<div>
							<Button
								variant="secondary"
								size="compact"
								isBusy={ isSubmitting && isSaving }
								onClick={ handleClick }
							>
								{ hasOptedIn && ! isSubmitting
									? translate( 'Go to new dashboard' )
									: translate( 'Try it out' ) }
							</Button>
						</div>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
