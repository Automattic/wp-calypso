import config from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import {
	Button,
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	isFetchingPreferences,
	preferencesLastSaveError,
} from 'calypso/state/preferences/selectors';
import illustratioUrl from './illustration.svg';
import type { HostingDashboardOptIn } from '@automattic/api-core';

interface BannerCopy {
	heading: TranslateResult;
	description: TranslateResult;
	button: TranslateResult;
}

function getBannerCopy(
	isOptedInCopy: boolean,
	hasEnTranslation: ReturnType< typeof useHasEnTranslation >,
	translate: ReturnType< typeof useTranslate >
): BannerCopy {
	if ( isOptedInCopy ) {
		const hasUpdatedOptedInTranslations =
			hasEnTranslation( 'New dashboard is here to stay' ) &&
			hasEnTranslation(
				'The new dashboard you’ve been testing is now the default. We’re retiring the earlier design.'
			);

		if ( hasUpdatedOptedInTranslations ) {
			return {
				heading: translate( 'New dashboard is here to stay' ),
				description: translate(
					'The new dashboard you’ve been testing is now the default. We’re retiring the earlier design.'
				),
				button: translate( 'Go to new dashboard' ),
			};
		}

		return {
			heading: translate( 'The new dashboard is here to stay' ),
			description: translate(
				'Soon, the Hosting Dashboard you’ve been using becomes the default for everyone, and this classic view will be retired. Your content and settings stay the same.'
			),
			button: translate( 'Go to new dashboard' ),
		};
	}

	const hasUpdatedTranslations =
		hasEnTranslation( 'Dashboard layout is changing' ) &&
		hasEnTranslation(
			'WordPress.com’s layout is getting more consistent and easier to use. Your content and settings won’t change. Can’t wait?'
		) &&
		hasEnTranslation( 'Switch now' );

	if ( hasUpdatedTranslations ) {
		return {
			heading: translate( 'Dashboard layout is changing' ),
			description: translate(
				'WordPress.com’s layout is getting more consistent and easier to use. Your content and settings won’t change. Can’t wait?'
			),
			button: translate( 'Switch now' ),
		};
	}

	return {
		heading: translate( 'A new dashboard is on the way' ),
		description: translate(
			'Soon, navigation in the Hosting Dashboard is changing to be more consistent with WordPress Admin and easier to get around. Your content and settings stay exactly as they are. Can’t wait?'
		),
		button: translate( 'Try it now' ),
	};
}

export default function HostingDashboardOptInBanner( {
	isMobile = false,
	onDismiss,
}: {
	isMobile?: boolean;
	onDismiss?: () => void;
} ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const dispatch = useDispatch();

	const savedPreference = useSelector(
		( state ) => getPreference( state, 'hosting-dashboard-opt-in' ) as HostingDashboardOptIn | null
	);
	const hasOptedIn = savedPreference?.value === 'opt-in';
	const isFetching = useSelector( isFetchingPreferences );

	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const isEnabled = config.isEnabled( 'dashboard/rollout-advance-notice' );

	const handleClick = async ( event: React.MouseEvent ) => {
		dispatch(
			recordTracksEvent( 'calypso_hosting_dashboard_advance_notice_banner_click', {
				is_opted_in: hasOptedIn,
			} )
		);

		if ( hasOptedIn ) {
			return;
		}

		event.preventDefault();
		setIsSubmitting( true );

		const preference = {
			value: 'opt-in',
			updated_at: new Date().toISOString(),
		} satisfies HostingDashboardOptIn;

		await dispatch( savePreference( 'hosting-dashboard-opt-in', preference ) );

		const saveError = dispatch( ( _dispatch, getState ) => preferencesLastSaveError( getState() ) );

		if ( saveError ) {
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

	const hasRecordedImpression = useRef( false );

	// Can not use the usual TrackComponentView component because `isFetching` is momentarily `false`
	// when the component first mounts, and we do not know whether it will start fetching or not.
	// We add a delay before recording the impression to leave some time for `isFetching` to become `true`.
	useEffect( () => {
		if ( ! isEnabled || hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		const timeout = setTimeout( () => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_dashboard_advance_notice_banner_impression', {
					is_opted_in: hasOptedIn,
				} )
			);
		}, 100 );
		return () => clearTimeout( timeout );
	}, [ isEnabled, hasOptedIn, dispatch ] );

	if ( ! isEnabled || isFetching ) {
		return null;
	}

	const isOptedInCopy = hasOptedIn && ! isSubmitting;
	const copy = getBannerCopy( isOptedInCopy, hasEnTranslation, translate );

	const heading = (
		<Text as="p" weight={ 500 } size={ isMobile ? 14 : 15 }>
			{ copy.heading }
		</Text>
	);

	const description = (
		<Text as="p" variant="muted" size={ isMobile ? 12 : 13 }>
			{ copy.description }
		</Text>
	);

	const button = (
		<Button
			variant="secondary"
			size={ isMobile ? 'compact' : undefined }
			isBusy={ isSubmitting }
			href={ dashboardLink() }
			onClick={ handleClick }
		>
			{ copy.button }
		</Button>
	);

	const dismissButton = onDismiss && (
		<Button icon={ closeSmall } aria-label={ translate( 'Dismiss' ) } onClick={ onDismiss } />
	);

	return (
		<Card style={ { width: '100%' } }>
			<CardBody style={ { padding: '12px' } }>
				{ isMobile ? (
					<VStack spacing={ 2 } alignment="flex-start">
						<HStack spacing={ 2 } alignment="flex-start" justify="space-between">
							<VStack spacing={ 0 }>
								{ heading }
								{ description }
							</VStack>
							{ dismissButton }
						</HStack>
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
