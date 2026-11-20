import { Onboard, Visibility } from '@automattic/data-stores';
import { SITE_MIGRATION_FLOW, Step } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { recordSignupComplete, SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	getSignupIsNewUserAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { Step as StepType } from '../../types';

export type SiteMigrationCheckoutReturnSubmits =
	| { action: 'configure' | 'continue'; siteId: number; siteSlug: string }
	| { action: 'site-unavailable' };

/**
 * Where unified checkout returns once it has created the destination. The migration is set up
 * here, once, for the tab that went to checkout; any other visit just moves on to the site.
 */
const SiteMigrationCheckoutReturn: StepType< {
	submits: SiteMigrationCheckoutReturnSubmits;
} > = function SiteMigrationCheckoutReturn( { navigation } ) {
	const { __ } = useI18n();
	const siteId = Number( useQuery().get( 'siteId' ) );
	// The flow records itself for this tab before checkout. Setting up resets a migration, so a
	// reload or a later visit mustn't do it again.
	const [ isCheckoutReturn ] = useState(
		() => siteId > 0 && getSignupCompleteFlowName() === SITE_MIGRATION_FLOW
	);
	const { data: site, isError } = useSiteQuery( siteId || undefined );
	const siteSlug = site?.slug;
	const userId = useSelector( getCurrentUserId );
	const hasSubmitted = useRef( false );

	const finish = useEffectEvent( async ( slug: string ) => {
		if ( ! isCheckoutReturn ) {
			return navigation.submit?.( { action: 'continue', siteId, siteSlug: slug } );
		}
		clearSignupCompleteFlowName();
		clearSignupDestinationCookie();
		recordSignupComplete(
			{
				flow: SITE_MIGRATION_FLOW,
				siteId,
				isNewUser: Boolean( getSignupIsNewUserAndClear( userId ) ),
				hasCartItems: true,
				planProductSlug: site?.plan?.product_slug,
				domainProductSlug: undefined,
				intent: SITE_MIGRATION_FLOW,
				startingPoint: SITE_MIGRATION_FLOW,
				signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.NOT_SET,
				framework: 'stepper',
				theme: undefined,
				isBlankCanvas: undefined,
				isTransfer: undefined,
				isMapping: undefined,
				goals: undefined,
			},
			true
		);
		// Logged-in checkout creates the site without the flow's site params, so apply them here
		// (signed out, checkout already has). They don't block the migration.
		await Promise.allSettled( [
			wpcom.req.post(
				{ path: `/sites/${ siteId }/settings`, apiVersion: '1.4' },
				{},
				{
					blogname: __( 'My Site' ),
					blog_public: Visibility.PublicNotIndexed,
					wpcom_public_coming_soon: 1,
				}
			),
			wpcom.req.post(
				{ path: `/sites/${ siteId }/site-intent`, apiNamespace: 'wpcom/v2' },
				{},
				{ site_intent: Onboard.SiteIntent.SiteMigration }
			),
		] );
		navigation.submit?.( { action: 'configure', siteId, siteSlug: slug } );
	} );

	useEffect( () => {
		if ( hasSubmitted.current ) {
			return;
		}
		if ( ! siteId || isError ) {
			hasSubmitted.current = true;
			navigation.submit?.( { action: 'site-unavailable' } );
		} else if ( siteSlug ) {
			hasSubmitted.current = true;
			finish( siteSlug );
		}
	}, [ siteId, isError, siteSlug, navigation ] );

	return (
		<>
			<DocumentHead title={ __( 'Setting up your migration' ) } />
			<Step.Loading title={ __( 'Setting up your migration' ) } />
		</>
	);
};

export default SiteMigrationCheckoutReturn;
