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

	const isFetching = useSelector( isFetchingPreferences );
	const isSaving = useSelector( isSavingPreference );
	const lastSaveError = useSelector( preferencesLastSaveError );

	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const handleClick = async () => {
		setIsSubmitting( true );

		recordTracksEvent( 'calypso_dashboard_opt_in_banner_click' );

		const preference = {
			value: 'opt-in',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		await dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );

		if ( lastSaveError ) {
			dispatch(
				errorNotice( translate( 'Failed to save preference.' ), {
					duration: 5000,
				} )
			);
		} else {
			window.location.href = '/v2';
		}
	};

	if ( isFetching || savedPreference?.value === 'opt-out' ) {
		return null;
	}

	return (
		<>
			<TrackComponentView eventName="calypso_dashboard_opt_in_banner_impression" />
			<Card>
				<CardBody style={ { padding: '12px' } }>
					<VStack spacing={ 3 }>
						<img src={ illustratioUrl } alt="illustration" />
						<VStack spacing={ 1 }>
							<Text as="p" weight={ 500 }>
								{ translate( 'Your dashboard, simplified' ) }
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
								{ translate( 'Try it out' ) }
							</Button>
						</div>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
