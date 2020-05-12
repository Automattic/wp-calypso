/**
 * External dependencies
 */
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { SITE_STORE } from '../../stores/site';
import './style.scss';
import DomainPickerButton from '../domain-picker-button';
import PlansButton from '../plans/plans-button';
import SignupForm from '../../components/signup-form';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../../utils/domain-suggestions';
import { PAID_DOMAINS_TO_SHOW } from '../../constants';
import { usePath, useCurrentStep, Step } from '../../path';
import { trackEventWithFlow } from '../../lib/analytics';

const Header: React.FunctionComponent = () => {
	const { __, i18nLocale } = useI18n();

	const currentStep = useCurrentStep();

	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const selectedPlanSlug = useSelectedPlan().getStoreSlug();

	const { domain, siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const makePath = usePath();

	const { createSite, setDomain } = useDispatch( ONBOARD_STORE );

	const allSuggestions = useDomainSuggestions( { searchOverride: siteTitle, locale: i18nLocale } );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		PAID_DOMAINS_TO_SHOW
	);
	const freeDomainSuggestion = getFreeDomainSuggestions( allSuggestions )?.[ 0 ];
	const recommendedDomainSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	React.useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	const [ showSignupDialog, setShowSignupDialog ] = React.useState( false );
	const [ previousRecommendedDomain, setPreviousRecommendedDomain ] = React.useState( '' );
	if (
		recommendedDomainSuggestion &&
		previousRecommendedDomain !== recommendedDomainSuggestion.domain_name
	) {
		setPreviousRecommendedDomain( recommendedDomainSuggestion.domain_name );
	}

	const {
		location: { pathname, search },
		push,
	} = useHistory();

	React.useEffect( () => {
		// This handles opening the signup modal when there is a ?signup query parameter
		// then removes the parameter.
		// The use case is a user clicking "Create account" from login
		// TODO: We can remove this condition when we've converted signup into it's own page
		if ( ! showSignupDialog && new URLSearchParams( search ).has( 'signup' ) ) {
			setShowSignupDialog( true );
			push( makePath( Step[ currentStep ] ) );
		} else {
			// Dialogs usually close naturally when the user clicks the browser's
			// back/forward buttons because their parent is unmounted. However
			// this header isn't unmounted on route changes so we need to
			// explicitly hide the dialog.
			setShowSignupDialog( false );
		}
	}, [ pathname, setShowSignupDialog ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const isMobile = useViewportMatch( 'mobile', '<' );

	const getDomainElementContent = () => {
		if ( recommendedDomainSuggestion || previousRecommendedDomain !== '' ) {
			/* translators: domain name is available, eg: "yourname.com is available" */
			return sprintf(
				__( '%s is available' ),
				recommendedDomainSuggestion
					? recommendedDomainSuggestion.domain_name
					: previousRecommendedDomain
			);
		}

		return 'example.wordpress.com';
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const domainElement = domain ? (
		domain.domain_name
	) : (
		<span className="gutenboarding__header-domain-picker-button-domain">
			{ isMobile && __( 'Domain available' ) }
			{ ! isMobile && getDomainElementContent() }
		</span>
	);

	const handleCreateSite = React.useCallback(
		( username: string, bearerToken?: string, planSlug?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken, planSlug );
		},
		[ createSite, freeDomainSuggestion ]
	);

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
	};

	React.useEffect( () => {
		if ( newUser && newUser.bearerToken && newUser.username && ! newSite ) {
			handleCreateSite( newUser.username, newUser.bearerToken, selectedPlanSlug );
		}
	}, [ newSite, newUser, handleCreateSite, selectedPlanSlug ] );

	const hasContent =
		!! domain || !! recommendedDomainSuggestion || previousRecommendedDomain !== '';

	const hasPlaceholder =
		!! siteTitle && ! recommendedDomainSuggestion && previousRecommendedDomain !== '';

	const onDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion | undefined ) => {
		trackEventWithFlow( 'calypso_newsite_select_domain', {
			domain_name: suggestion?.domain_name,
		} );
		setDomain( suggestion );
	};

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-site-title-section">
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : __( 'Start your website' ) }
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-domain-section">
					{
						// We display the DomainPickerButton as soon as we have a domain suggestion,
						// unless we're still at the IntentGathering step. In that case, we only
						// show it comes from a site title (but hide it if it comes from a vertical).
						domainElement &&
							( siteTitle || previousRecommendedDomain || currentStep !== 'IntentGathering' ) && (
								<div
									className={ classnames( 'gutenboarding__header-domain-picker-button-container', {
										'has-content': hasContent,
										'has-placeholder': hasPlaceholder,
									} ) }
								>
									<DomainPickerButton
										className="gutenboarding__header-domain-picker-button"
										currentDomain={ domain }
										onDomainSelect={ onDomainSelect }
									>
										{ domainElement }
									</DomainPickerButton>
								</div>
							)
					}
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-section-item--right">
					<PlansButton />
				</div>
			</section>
			{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
		</div>
	);
};

export default Header;
