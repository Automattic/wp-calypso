/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	StepContainer,
	LINK_IN_BIO_FLOW,
	LINK_IN_BIO_TLD_FLOW,
	COPY_SITE_FLOW,
	isCopySiteFlow,
	NEWSLETTER_FLOW,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	domainRegistration,
	domainMapping,
	domainTransfer,
} from 'calypso/lib/cart-values/cart-items';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
} from 'calypso/state/domains/actions';
import { ONBOARD_STORE } from '../../../../stores';
import { DomainFormControl } from './domain-form-control';
import type { Step } from '../../types';
import type { DomainSuggestion } from '@automattic/data-stores';
import './style.scss';

const DomainsStep: Step = function DomainsStep( { navigation, flow } ) {
	const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );

	const { __ } = useI18n();

	const [ showUseYourDomain, setShowUseYourDomain ] = useState( false );

	const dispatch = useReduxDispatch();

	const { submit, exitFlow } = navigation;

	const submitDomainStepSelection = ( suggestion: DomainSuggestion, section: string ) => {
		let domainType = 'domain_reg';
		if ( suggestion.is_free ) {
			domainType = 'wpcom_subdomain';
			if ( suggestion.domain_name.endsWith( '.blog' ) ) {
				domainType = 'dotblog_subdomain';
			}
		}

		const tracksObjects: {
			label?: string;
			domain_name: string;
			type: string;
			section: string;
		} = {
			domain_name: suggestion.domain_name,
			section,
			type: domainType,
		};
		if ( suggestion.isRecommended ) {
			tracksObjects.label = 'recommended';
		}
		if ( suggestion.isBestAlternative ) {
			tracksObjects.label = 'best-alternative';
		}

		return composeAnalytics(
			recordGoogleEvent(
				'Domain Search',
				`Submitted Domain Selection for a ${ domainType } on a Domain Registration`,
				'Domain Name',
				suggestion.domain_name
			),
			recordTracksEvent( 'calypso_domain_search_submit_step', tracksObjects )
		);
	};

	const submitWithDomain = (
		suggestion: DomainSuggestion | undefined,
		shouldHideFreePlan = false
	) => {
		if ( suggestion ) {
			const domainCartItem = domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug || '',
			} );
			dispatch( submitDomainStepSelection( suggestion, getAnalyticsSection() ) );

			setHideFreePlan( Boolean( suggestion.product_slug ) || shouldHideFreePlan );
			setDomainCartItem( domainCartItem );
		}

		submit?.();
	};

	const handleSkip = ( _googleAppsCartItem = undefined, shouldHideFreePlan = false ) => {
		const tracksProperties = Object.assign(
			{
				section: getAnalyticsSection(),
				flow,
				step: 'domains',
			},
			{}
		);

		dispatch( recordTracksEvent( 'calypso_signup_skip_step', tracksProperties ) );

		submitWithDomain( undefined, shouldHideFreePlan );
	};

	const getSubHeaderText = () => {
		const decideLaterComponent = {
			span: (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
				<span
					role="button"
					className="tailored-flow-subtitle__cta-text"
					onClick={ () => handleSkip() }
				/>
			),
		};

		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return createInterpolateElement(
					__(
						'Help your Newsletter stand out with a custom domain. Not sure yet? <span>Decide later</span>.'
					),
					decideLaterComponent
				);
			case LINK_IN_BIO_FLOW:
			case LINK_IN_BIO_TLD_FLOW:
				return createInterpolateElement(
					__(
						'Set your Link in Bio apart with a custom domain. Not sure yet? <span>Decide later</span>.'
					),
					decideLaterComponent
				);
			case COPY_SITE_FLOW:
				return __( 'Make your copied site unique with a custom domain all of its own.' );
			default:
				return createInterpolateElement(
					__(
						'Help your site stand out with a custom domain. Not sure yet? <span>Decide later</span>.'
					),
					decideLaterComponent
				);
		}
	};

	const getHeaderText = () => {
		if ( showUseYourDomain ) {
			return '';
		}

		return __( 'Choose a domain' );
	};

	function getAnalyticsSection() {
		return 'signup';
	}

	const handleAddTransfer = ( { domain, authCode }: { domain: string; authCode: string } ) => {
		const domainCartItem = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );

		dispatch( recordAddDomainButtonClickInTransferDomain( domain, getAnalyticsSection() ) );

		setDomainCartItem( domainCartItem );

		submit?.();
	};

	const handleAddMapping = ( domain: string ) => {
		const domainCartItem = domainMapping( { domain } );

		dispatch( recordAddDomainButtonClickInMapDomain( domain, getAnalyticsSection() ) );

		setDomainCartItem( domainCartItem );

		submit?.();
	};

	const handleAddDomain = ( suggestion: DomainSuggestion, position: number ) => {
		dispatch(
			recordAddDomainButtonClick(
				suggestion.domain_name,
				getAnalyticsSection(),
				position,
				suggestion?.is_premium
			)
		);

		submitWithDomain( suggestion );
	};

	const renderContent = () => (
		<DomainFormControl
			analyticsSection={ getAnalyticsSection() }
			flow={ flow }
			onAddDomain={ handleAddDomain }
			onAddMapping={ handleAddMapping }
			onAddTransfer={ handleAddTransfer }
			onSkip={ handleSkip }
			onUseYourDomainClick={ () => setShowUseYourDomain( true ) }
			showUseYourDomain={ showUseYourDomain }
		/>
	);

	return (
		<StepContainer
			stepName="domains"
			isWideLayout={ true }
			hideBack={ ! isCopySiteFlow( flow ) }
			backLabelText={ __( 'Back to sites' ) }
			hideSkip={ true }
			flowName={ isCopySiteFlow( flow ) ? ( flow as string ) : ( flow as string ) }
			stepContent={ <div className="domains__content">{ renderContent() }</div> }
			recordTracksEvent={ recordTracksEvent }
			goBack={ () => exitFlow?.( '/sites' ) }
			goNext={ () => submit?.() }
			formattedHeader={
				<FormattedHeader
					id="domains-header"
					align="left"
					headerText={ getHeaderText() }
					subHeaderText={ getSubHeaderText() }
				/>
			}
		/>
	);
};

export default DomainsStep;
