import { useFlowProgress, COPY_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteCopy } from '../hooks/use-site-copy';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import AutomatedCopySite from './internals/steps-repository/automated-copy-site';
import DomainsStep from './internals/steps-repository/domains';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

function useIsValidSite() {
	const urlQueryParams = useQuery();
	const sourceSlug = urlQueryParams.get( 'sourceSlug' );
	const [ siteRequestStatus, setSiteRequestStatus ] = useState< 'init' | 'fetching' | 'finished' >(
		'init'
	);

	const {
		isFetching,
		isFetchingError,
		site: sourceSite,
	} = useSelect( ( select ) => {
		if ( ! sourceSlug ) {
			return {};
		}
		return {
			isFetchingError: select( SITE_STORE ).getFetchingSiteError(),
			isFetching: select( SITE_STORE ).isFetchingSiteDetails(),
			site: select( SITE_STORE ).getSite( sourceSlug ),
		};
	} );

	useEffect( () => {
		if ( isFetching && siteRequestStatus === 'init' ) {
			setSiteRequestStatus( 'fetching' );
		} else if ( ( ! isFetching && siteRequestStatus === 'fetching' ) || sourceSite?.ID ) {
			setSiteRequestStatus( 'finished' );
		}
	}, [ isFetching, siteRequestStatus, sourceSite?.ID ] );

	const { shouldShowSiteCopyItem, isLoadingPurchase } = useSiteCopy( sourceSite );
	return {
		isValidSite: shouldShowSiteCopyItem,
		hasFetchedSiteDetails: siteRequestStatus === 'finished' && ! isLoadingPurchase,
		isFetchingError,
	};
}

const copySite: Flow = {
	name: COPY_SITE_FLOW,

	get title() {
		return translate( 'Copy Site' );
	},

	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_copy_site', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'site-creation-step', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'automated-copy', component: AutomatedCopySite },
			{
				slug: 'processing-copy',
				component: ( props ) => (
					<ProcessingStep
						{ ...props }
						title={ translate( 'We’re copying your site' ) }
						subtitle={ translate(
							'This may take a few minutes. Feel free to close this window, we’ll email you when it’s done.'
						) }
					/>
				),
			},
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );

		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const urlQueryParams = useQuery();

		setStepProgress( flowProgress );

		const submit = async (
			providedDependencies: ProvidedDependencies = {},
			...params: string[]
		) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'domains': {
					return navigate( 'site-creation-step' );
				}

				case 'site-creation-step': {
					return navigate( 'processing' );
				}

				case 'processing': {
					const destination = addQueryArgs( `/setup/${ this.name }/automated-copy`, {
						sourceSlug: urlQueryParams.get( 'sourceSlug' ),
						siteSlug: providedDependencies?.siteSlug,
					} );
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );
					return window.location.assign(
						`/checkout/${ encodeURIComponent(
							( providedDependencies?.siteSlug as string ) ?? ''
						) }?redirect_to=${ returnUrl }&signup=1`
					);
				}

				case 'automated-copy': {
					return navigate( 'processing-copy' );
				}

				case 'processing-copy': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						// @TODO:Create a retry step
						return navigate( 'retry' );
					}
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

		return { goNext, goBack, goToStep, submit };
	},

	useAssertConditions() {
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const { isValidSite, hasFetchedSiteDetails, isFetchingError } = useIsValidSite();

		if ( ! isValidSite ) {
			if ( hasFetchedSiteDetails || isFetchingError ) {
				window.location.assign( `/sites` );
				result = {
					state: AssertConditionState.FAILURE,
					message: isFetchingError
						? 'Copy Site flow couldn´t fetch source site details.'
						: 'Copy Site flow requires a valid source site.',
				};
			}
		}

		return result;
	},
};

export default copySite;
