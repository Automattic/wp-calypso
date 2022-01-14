import DomainPicker, { getDomainSuggestionsVendor } from '@automattic/domain-picker';
import { useLocale } from '@automattic/i18n-utils';
import {
	Title,
	SubTitle,
	ActionButtons,
	BackButton,
	NextButton,
	SkipButton,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { FLOW_ID, domainIsAvailableStatus } from '../../constants';
import useLastLocation from '../../hooks/use-last-location';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { trackEventWithFlow } from '../../lib/analytics';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import waitForDomainAvailability from './wait-for-domain-availability';
import type { DomainSuggestions } from '@automattic/data-stores';

import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type DomainAvailability = DomainSuggestions.DomainAvailability;

interface Props {
	isModal?: boolean;
}

const DomainsStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();
	const { goBack, goNext } = useStepNavigation();
	const { goLastLocation } = useLastLocation();

	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );

	// using the selector will get the explicit domain search query with site title as fallback
	const domainSearch = useSelect( ( select ) => select( ONBOARD_STORE ).getDomainSearch() );

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const isCheckingDomainAvailability = useSelect( ( select ): boolean =>
		select( 'core/data' ).isResolving( DOMAIN_SUGGESTIONS_STORE, 'isAvailable', [
			domain?.domain_name,
		] )
	);

	const { setDomain, setDomainSearch, setHasUsedDomainsStep } = useDispatch( ONBOARD_STORE );

	React.useEffect( () => {
		! isModal && setHasUsedDomainsStep( true );
	}, [ isModal, setHasUsedDomainsStep ] );

	// Keep a copy of the selected domain locally so it's available when the component is unmounting
	const selectedDomainRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedDomainRef.current = domain?.domain_name;
	}, [ domain ] );

	useTrackStep( isModal ? 'DomainsModal' : 'Domains', () => ( {
		selected_domain: selectedDomainRef.current,
	} ) );

	const handleBack = () => ( isModal ? goLastLocation() : goBack() );
	const handleNext = () => {
		trackEventWithFlow( 'calypso_newsite_domain_select', {
			domain_name: selectedDomainRef.current,
		} );
		if ( isModal ) {
			goLastLocation();
		} else {
			goNext();
		}
	};
	const handleDomainAvailabilityCheck = async () => {
		if ( domain ) {
			if ( domain?.is_free ) {
				// is this a reliable way to check for .wordpress.com subdomains?
				handleNext();
			} else {
				try {
					const availability: DomainAvailability | undefined = await waitForDomainAvailability(
						domain?.domain_name
					);
					if ( domainIsAvailableStatus.includes( availability?.status ) ) {
						// If the selected domain is available, proceed to next step.
						handleNext();
					}
				} catch {
					// if there is an error checking the domain availability, do we continue as normal?
					handleNext();
				}
			}
		}
	};

	const onDomainSelect = ( suggestion: DomainSuggestion | undefined ) => {
		setDomain( suggestion );
	};

	const fallbackSubtitleText = __( 'Free for the first year with any paid plan.' );
	const newSubtitleText = __( 'Free for the first year with any annual plan.' );
	const subtitleText =
		locale === 'en' || hasTranslation?.( 'Free for the first year with any annual plan.' )
			? newSubtitleText
			: fallbackSubtitleText;

	const header = (
		<div className="domains__header">
			<div>
				<Title data-e2e-string="Choose a domain">{ __( 'Choose a domain' ) }</Title>
				<SubTitle data-e2e-string="Free for the first year with any annual plan.">
					{ subtitleText }
				</SubTitle>
			</div>
			<ActionButtons>
				<BackButton onClick={ handleBack } />
				{ domain ? (
					<NextButton
						onClick={ handleDomainAvailabilityCheck }
						disabled={ isCheckingDomainAvailability }
					/>
				) : (
					<SkipButton onClick={ handleNext } />
				) }
			</ActionButtons>
		</div>
	);

	const trackDomainSearchInteraction = ( query: string ) => {
		trackEventWithFlow( 'calypso_newsite_domain_search_blur', {
			query,
			where: isModal ? 'domain_modal' : 'domain_page',
		} );
	};

	const handleUseYourDomain = () => {
		trackEventWithFlow( 'calypso_newsite_use_your_domain_click', {
			where: isModal ? 'domain_modal' : 'domain_page',
		} );
		window.location.href = `/start/domains/use-your-domain?source=${ window.location.href }`;
	};

	return (
		<div className="gutenboarding-page domains">
			<DomainPicker
				header={ header }
				analyticsFlowId={ FLOW_ID }
				initialDomainSearch={ domainSearch }
				onSetDomainSearch={ setDomainSearch }
				onDomainSearchBlur={ trackDomainSearchInteraction }
				currentDomain={ domain }
				isCheckingDomainAvailability={ isCheckingDomainAvailability }
				onDomainSelect={ onDomainSelect }
				analyticsUiAlgo={ isModal ? 'domain_modal' : 'domain_page' }
				locale={ locale }
				onUseYourDomainClick={ currentUser ? handleUseYourDomain : undefined }
				vendor={ getDomainSuggestionsVendor( { isSignup: true } ) }
			/>
		</div>
	);
};

export default DomainsStep;
