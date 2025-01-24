import page from '@automattic/calypso-router';
import { Badge, Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import ConnectDomainStepSupportInfoLink from 'calypso/components/domains/connect-domain-step/connect-domain-step-support-info-link';
import DomainTransferRecommendation from 'calypso/components/domains/domain-transfer-recommendation';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import FormattedHeader from 'calypso/components/formatted-header';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { isSubdomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementEdit,
	domainManagementList,
	domainUseMyDomain,
	domainMappingSetup,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepSwitchSetupInfoLink from './connect-domain-step-switch-setup-info-link';
import { isMappingVerificationSuccess } from './connect-domain-step-verification-status-parsing.js';
import ConnectDomainSteps from './connect-domain-steps';
import { modeType, stepType, stepSlug, defaultDomainSetupInfo } from './constants';
import {
	connectADomainStepsDefinition,
	connectASubdomainStepsDefinition,
} from './page-definitions.js';

import './style.scss';

function ConnectDomainStep( {
	domain,
	initialStep,
	selectedSite,
	showErrors,
	isFirstVisit,
	queryError,
	queryErrorDescription,
	currentRoute,
} ) {
	const { __ } = useI18n();
	const stepsDefinition = isSubdomain( domain )
		? connectASubdomainStepsDefinition
		: connectADomainStepsDefinition;
	const firstStep = isSubdomain( domain )
		? stepSlug.SUBDOMAIN_SUGGESTED_START
		: stepSlug.SUGGESTED_START;
	const [ pageSlug, setPageSlug ] = useState( firstStep );
	const [ verificationStatus, setVerificationStatus ] = useState( {} );
	const [ verificationInProgress, setVerificationInProgress ] = useState( false );
	const [ domainSetupInfo, setDomainSetupInfo ] = useState( defaultDomainSetupInfo );
	const [ domainSetupInfoError, setDomainSetupInfoError ] = useState( {} );
	const [ loadingDomainSetupInfo, setLoadingDomainSetupInfo ] = useState( false );

	const baseClassName = 'connect-domain-step';
	if ( stepsDefinition[ pageSlug ] === undefined ) {
		// eslint-disable-next-line no-console
		console.error(
			'Tried to set invalid pageSlug in ConnectDomainStep',
			pageSlug,
			firstStep,
			domain
		);
	}
	const currentStep = stepsDefinition[ pageSlug ] || stepsDefinition[ firstStep ];
	const isStepStart = stepType.START === currentStep.step;
	const mode = currentStep.mode;
	const step = currentStep.step;
	const prevPageSlug = currentStep.prev;
	const isTwoColumnLayout = ! currentStep.singleColumnLayout;

	const statusRef = useRef( {} );

	const dispatch = useDispatch();
	const recordMappingSetupTracksEvent = useCallback(
		( resolvedPageSlug, supportsOurDomainConnectTemplate, domainConnectProviderId ) => {
			dispatch(
				recordTracksEvent( 'calypso_domain_mapping_setup_page_view', {
					domain,
					page_slug: resolvedPageSlug,
					query_error: queryError,
					query_error_description: queryErrorDescription,
					supports_our_domain_connect_template: supportsOurDomainConnectTemplate,
					domain_connect_provider_id: domainConnectProviderId,
				} )
			);
		},
		[ dispatch, domain, queryError, queryErrorDescription ]
	);

	const resolveMappingSetupStep = useCallback(
		( connectionMode, supportsDomainConnect, domainName ) => {
			if ( initialStep ) {
				return initialStep;
			}
			// If connectionMode is present we'll send you to the last step of the relevant flow
			if ( connectionMode ) {
				if ( isSubdomain( domainName ) ) {
					return connectionMode === modeType.ADVANCED
						? stepSlug.SUBDOMAIN_ADVANCED_UPDATE
						: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE;
				}
				if ( connectionMode === modeType.ADVANCED ) {
					return stepSlug.ADVANCED_UPDATE;
				} else if ( connectionMode === modeType.DC ) {
					return stepSlug.DC_START;
				}
				return stepSlug.SUGGESTED_UPDATE;
			}
			// If connectionMode is not present we'll send you to one of the start steps
			if ( supportsDomainConnect ) {
				return stepSlug.DC_START;
			}
			return firstStep;
		},
		[ initialStep, firstStep ]
	);

	const verifyConnection = useCallback(
		( setStepAfterVerify = true ) => {
			setVerificationStatus( {} );
			setVerificationInProgress( true );

			let connectedSlug =
				modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_CONNECTED : stepSlug.ADVANCED_CONNECTED;
			let verifyingSlug =
				modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_VERIFYING : stepSlug.ADVANCED_VERIFYING;

			if ( isSubdomain( domain ) ) {
				connectedSlug =
					modeType.SUGGESTED === mode
						? stepSlug.SUBDOMAIN_SUGGESTED_CONNECTED
						: stepSlug.SUBDOMAIN_ADVANCED_CONNECTED;
				verifyingSlug =
					modeType.SUGGESTED === mode
						? stepSlug.SUBDOMAIN_SUGGESTED_VERIFYING
						: stepSlug.SUBDOMAIN_ADVANCED_VERIFYING;
			}

			wpcom
				.domain( domain )
				.updateConnectionModeAndGetMappingStatus( mode )
				.then( ( data ) => {
					setVerificationStatus( { data } );
					if ( setStepAfterVerify ) {
						if ( isMappingVerificationSuccess( mode, data ) ) {
							setPageSlug( connectedSlug );
						} else {
							setPageSlug( verifyingSlug );
						}
					}
				} )
				.catch( ( error ) => {
					setVerificationStatus( { error } );
					if ( setStepAfterVerify ) {
						setPageSlug( verifyingSlug );
					}
				} )
				.finally( () => setVerificationInProgress( false ) );
		},
		[ domain, mode ]
	);

	useEffect( () => {
		if ( statusRef.current?.hasLoadedStatusInfo?.[ domain ] || loadingDomainSetupInfo ) {
			return;
		}

		setDomainSetupInfoError( {} );
		setLoadingDomainSetupInfo( true );
		wpcom
			.domain( domain )
			.mappingSetupInfo( selectedSite.ID, {
				redirect_uri:
					'https://wordpress.com' +
					domainMappingSetup( selectedSite.slug, domain, stepSlug.DC_RETURN ),
			} )
			.then( ( data ) => {
				setDomainSetupInfo( { data } );
				const resolvedPageSlug = resolveMappingSetupStep(
					data?.connection_mode,
					!! data?.domain_connect_apply_wpcom_hosting,
					domain
				);
				setPageSlug( resolvedPageSlug );
				recordMappingSetupTracksEvent(
					resolvedPageSlug,
					!! data?.domain_connect_apply_wpcom_hosting,
					data?.domain_connect_provider_id
				);
				statusRef.current.hasLoadedStatusInfo = { [ domain ]: true };
			} )
			.catch( ( error ) => setDomainSetupInfoError( { error } ) )
			.finally( () => setLoadingDomainSetupInfo( false ) );
	}, [
		selectedSite,
		domain,
		resolveMappingSetupStep,
		domainSetupInfo,
		loadingDomainSetupInfo,
		selectedSite.ID,
		recordMappingSetupTracksEvent,
	] );

	useEffect( () => {
		if ( ! showErrors || statusRef.current?.hasFetchedVerificationStatus ) {
			return;
		}

		statusRef.current.hasFetchedVerificationStatus = true;
		verifyConnection( false );
	}, [ showErrors, verifyConnection ] );

	const renderTitle = () => {
		const headerText = sprintf(
			/* translators: %s: domain name being connected (ex.: example.com) */
			__( 'Connect %s' ),
			domain
		);

		return (
			<div className={ baseClassName + '__title' }>
				<FormattedHeader
					className={ baseClassName + '__page-heading' }
					headerText={ headerText }
					align="left"
				/>
				{ modeType.ADVANCED === mode && (
					<Badge className={ baseClassName + '__badge' }>{ __( 'Advanced' ) }</Badge>
				) }
			</div>
		);
	};

	const renderHeader = () => {
		let items = [
			{
				label: isUnderDomainManagementAll( currentRoute ) ? __( 'All Domains' ) : __( 'Domains' ),
				href: domainManagementList( selectedSite.slug, domain ),
			},
			{
				label: __( 'Use a domain I own' ),
				href: domainUseMyDomain( selectedSite.slug ),
			},
			{
				label: __( 'Transfer or connect' ),
				href: domainUseMyDomain( selectedSite.slug, { domain } ),
			},
			{ label: __( 'Connect' ) },
		];

		let mobileItem = {
			label: __( 'Back to transfer or connect' ),
			href: domainUseMyDomain( selectedSite.slug, { domain } ),
			showBackArrow: true,
		};

		if ( ! isFirstVisit ) {
			items = [
				{
					label: __( 'Domains' ),
					href: domainManagementList( selectedSite.slug, currentRoute ),
				},
				{
					label: domain,
					href: domainManagementEdit( selectedSite.slug, domain, currentRoute ),
				},
				{ label: __( 'Connect' ) },
			];

			mobileItem = {
				label: __( 'Back' ),
				href: domainManagementEdit( selectedSite.slug, domain, currentRoute ),
				showBackArrow: true,
			};
		}

		return (
			<DomainHeader items={ items } mobileItem={ mobileItem } titleOverride={ renderTitle() } />
		);
	};

	const goBack = () => {
		if ( prevPageSlug ) {
			setPageSlug( prevPageSlug );
		} else {
			page( domainManagementList( selectedSite.slug, currentRoute ) );
		}
	};

	const renderContent = () => {
		if ( loadingDomainSetupInfo === true ) {
			return (
				<div className={ baseClassName + '__content-placeholder' }>
					<p></p>
					<p></p>
					<p></p>
					<p></p>
					<p></p>
				</div>
			);
		}

		return (
			<>
				{ prevPageSlug && (
					<BackButton className={ baseClassName + '__go-back' } onClick={ goBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ __( 'Back' ) }
					</BackButton>
				) }
				<ConnectDomainSteps
					baseClassName={ baseClassName }
					domain={ domain }
					initialPageSlug={ pageSlug }
					stepsDefinition={ stepsDefinition }
					onSetPage={ setPageSlug }
					onVerifyConnection={ verifyConnection }
					verificationInProgress={ verificationInProgress }
					verificationStatus={ verificationStatus || {} }
					domainSetupInfo={ domainSetupInfo }
					domainSetupInfoError={ domainSetupInfoError }
					showErrors={ showErrors }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
				/>
			</>
		);
	};

	const renderSidebar = () => {
		if ( loadingDomainSetupInfo === true ) {
			return <div className={ baseClassName + '__sidebar-placeholder' }></div>;
		}

		if ( ! isStepStart || ! domainSetupInfo?.data?.is_supported_tld ) {
			return null;
		}

		return <DomainTransferRecommendation />;
	};

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'connect-domain-setup__body-white' ] } />
			{ renderHeader() }
			{ isTwoColumnLayout ? (
				<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
			) : (
				renderContent()
			) }
			{ loadingDomainSetupInfo === false && (
				<>
					<ConnectDomainStepSupportInfoLink baseClassName={ baseClassName } mode={ mode } />
					<ConnectDomainStepSwitchSetupInfoLink
						baseClassName={ baseClassName }
						supportsDomainConnect={ !! domainSetupInfo?.data?.domain_connect_apply_wpcom_hosting }
						currentMode={ mode }
						currentStep={ step }
						isSubdomain={ isSubdomain( domain ) }
						setPage={ setPageSlug }
					/>
				</>
			) }
		</>
	);
}

ConnectDomainStep.propTypes = {
	domain: PropTypes.string.isRequired,
	domains: PropTypes.array,
	selectedSite: PropTypes.object,
	initialStep: PropTypes.string,
	showErrors: PropTypes.bool,
	hasSiteDomainsLoaded: PropTypes.bool,
	isFirstVisit: PropTypes.bool,
	queryError: PropTypes.string,
	queryErrorDescription: PropTypes.string,
};

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const siteId = selectedSite?.ID;

	return {
		domains: getDomainsBySiteId( state, siteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
		selectedSite,
		currentRoute: getCurrentRoute( state ),
	};
} )( ConnectDomainStep );
