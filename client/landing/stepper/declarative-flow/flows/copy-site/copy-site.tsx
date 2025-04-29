import { COPY_SITE_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteCopy } from '../../../hooks/use-site-copy';
import { STEPS } from '../../internals/steps';
import {
	AssertConditionState,
	type AssertConditionResult,
	type Flow,
	type ProvidedDependencies,
	type StepperStep,
} from '../../internals/types';
import type { SiteSelect } from '@automattic/data-stores';

function useIsValidSite() {
	const urlQueryParams = useQuery();
	const sourceSlug = urlQueryParams.get( 'sourceSlug' );
	const [ siteRequestStatus, setSiteRequestStatus ] = useState< 'init' | 'fetching' | 'finished' >(
		'init'
	);

	const {
		isFetchingSiteDetails,
		isFetchingError,
		site: sourceSite,
	} = useSelect(
		( select ) => {
			if ( ! sourceSlug ) {
				return {};
			}
			return {
				isFetchingError: ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
				isFetchingSiteDetails: ( select( SITE_STORE ) as SiteSelect ).isFetchingSiteDetails(),
				site: ( select( SITE_STORE ) as SiteSelect ).getSite( sourceSlug ),
			};
		},
		[ sourceSlug ]
	);

	useEffect( () => {
		if ( isFetchingSiteDetails && siteRequestStatus === 'init' ) {
			setSiteRequestStatus( 'fetching' );
		} else if (
			( ! isFetchingSiteDetails && siteRequestStatus === 'fetching' ) ||
			sourceSite?.ID
		) {
			setSiteRequestStatus( 'finished' );
		}
	}, [ isFetchingSiteDetails, siteRequestStatus, sourceSite?.ID ] );

	const { shouldShowSiteCopyItem, isFetching: isFetchingSiteCopy } = useSiteCopy( sourceSite );
	return {
		isValidSite: shouldShowSiteCopyItem,
		hasFetchedSiteDetails: siteRequestStatus === 'finished' && ! isFetchingSiteCopy,
		isFetchingError,
	};
}

const COPY_SITE_STEPS = [
	STEPS.DOMAINS,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
	STEPS.AUTOMATED_COPY_SITE,
	STEPS.PROCESSING_COPY_SITE_FLOW,
	{ ...STEPS.PROCESSING, slug: 'resuming' as StepperStep[ 'slug' ] } as StepperStep,
];

const copySite: Flow = {
	name: COPY_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	get title() {
		return '';
	},
	isSignupFlow: false,

	useSteps() {
		return COPY_SITE_STEPS;
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const urlQueryParams = useQuery();

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'domains': {
					return navigate( 'create-site', {
						sourceSlug: urlQueryParams.get( 'sourceSlug' ),
					} );
				}

				case 'create-site': {
					return navigate( 'processing' );
				}

				case 'resuming' as StepperStep[ 'slug' ]:
				case 'processing': {
					const siteSlug = providedDependencies?.siteSlug || urlQueryParams.get( 'siteSlug' );
					const destination = addQueryArgs( `/setup/${ this.name }/automated-copy`, {
						sourceSlug: urlQueryParams.get( 'sourceSlug' ),
						siteSlug: siteSlug,
					} );
					persistSignupDestination( destination );
					setSignupCompleteSlug( siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );
					const plan = urlQueryParams.get( 'plan' );
					return window.location.assign(
						`/checkout/${ plan }/${ encodeURIComponent(
							( siteSlug as string ) ?? ''
						) }?redirect_to=${ returnUrl }&signup=1`
					);
				}

				case 'automated-copy': {
					return navigate( 'processing-copy' );
				}

				case 'processing-copy': {
					clearSignupDestinationCookie();
					return window.location.assign( `/home/${ providedDependencies?.siteSlug }` );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		const exitFlow = ( location = '/sites' ) => {
			window.location.assign( location );
		};

		return { goNext, goBack, goToStep, submit, exitFlow };
	},

	useAssertConditions() {
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const urlQueryParams = useQuery();
		const sourceSlug = urlQueryParams.get( 'sourceSlug' );
		const { isValidSite, hasFetchedSiteDetails, isFetchingError } = useIsValidSite();

		if ( ! sourceSlug || isFetchingError || ( ! isValidSite && hasFetchedSiteDetails ) ) {
			window.location.assign( '/sites' );
			result = {
				state: AssertConditionState.FAILURE,
				message: isFetchingError
					? 'Copy Site flow couldn´t fetch source site details.'
					: 'Copy Site flow requires a valid source site.',
			};
		} else if ( ! hasFetchedSiteDetails ) {
			result = {
				state: AssertConditionState.CHECKING,
			};
		}

		return result;
	},
};

export default copySite;
