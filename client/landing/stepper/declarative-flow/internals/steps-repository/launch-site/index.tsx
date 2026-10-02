import { siteLaunchMutation } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getLaunchReturnUrl } from 'calypso/lib/site-launch/destination';
import type { Step as StepType } from '../../types';

const LaunchSiteStep: StepType = function LaunchSiteStep( { navigation } ) {
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site?.ID;
	const query = useQuery();
	const { mutate, error } = useMutation( siteLaunchMutation( siteId ?? 0 ) );
	const hasLaunched = useRef( false );

	useEffect( () => {
		// Launch once per mount, so a failure doesn't turn into a request loop.
		if ( ! siteId || hasLaunched.current ) {
			return;
		}

		hasLaunched.current = true;
		mutate( undefined, { onSuccess: () => navigation.submit() } );
	}, [ siteId, mutate, navigation ] );

	if ( ! error ) {
		return (
			<>
				<DocumentHead title={ __( 'Launch your site' ) } />
				<Step.Loading title={ __( 'Your site will be live shortly.' ) } />
			</>
		);
	}

	const returnUrl = getLaunchReturnUrl( {
		siteSlug: query.get( 'siteSlug' ) ?? '',
		backTo: query.get( 'back_to' ),
		ref: query.get( 'ref' ),
	} );

	return (
		<>
			<DocumentHead title={ __( 'Launch your site' ) } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				topBar={ <Step.TopBar /> }
				heading={
					<Step.Heading
						text={ __( 'We couldn’t launch your site' ) }
						subText={
							error.message || __( 'Something went wrong and we couldn’t launch your site.' )
						}
					/>
				}
			>
				<Step.PrimaryButton href={ returnUrl }>{ __( 'Go back' ) }</Step.PrimaryButton>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default LaunchSiteStep;
