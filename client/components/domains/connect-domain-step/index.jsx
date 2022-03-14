import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import ConnectDomainStepSupportInfoLink from 'calypso/components/domains/connect-domain-step/connect-domain-step-support-info-link';
import DomainTransferRecommendation from 'calypso/components/domains/domain-transfer-recommendation';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import FormattedHeader from 'calypso/components/formatted-header';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { isSubdomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementEdit,
	domainManagementList,
	domainUseMyDomain,
} from 'calypso/my-sites/domains/paths';
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
	selectedSite,
	initialSetupInfo,
	initialStep,
	showErrors,
	isFirstVisit,
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
	const isStepStart = stepType.START === stepsDefinition[ pageSlug ].step;
	const mode = stepsDefinition[ pageSlug ].mode;
	const step = stepsDefinition[ pageSlug ].step;
	const prevPageSlug = stepsDefinition[ pageSlug ].prev;
	const isTwoColumnLayout = ! stepsDefinition[ pageSlug ].singleColumnLayout;

	const statusRef = useRef( {} );

	useEffect( () => {
		if ( initialStep && Object.values( stepSlug ).includes( initialStep ) ) {
			setPageSlug( initialStep );
		}
	}, [ initialStep, setPageSlug ] );

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

		( () => {
			setDomainSetupInfoError( {} );
			setLoadingDomainSetupInfo( true );
			wpcom
				.domain( domain )
				.mappingSetupInfo( selectedSite.ID, domain )
				.then( ( data ) => {
					setDomainSetupInfo( { data } );
					statusRef.current.hasLoadedStatusInfo = { [ domain ]: true };
				} )
				.catch( ( error ) => setDomainSetupInfoError( { error } ) )
				.finally( () => setLoadingDomainSetupInfo( false ) );
		} )();
	}, [ domain, domainSetupInfo, initialSetupInfo, loadingDomainSetupInfo, selectedSite.ID ] );

	useEffect( () => {
		if ( ! showErrors || statusRef.current?.hasFetchedVerificationStatus ) {
			return;
		}

		statusRef.current.hasFetchedVerificationStatus = true;
		verifyConnection( false );
	}, [ showErrors, verifyConnection ] );

	const renderBreadcrumbs = () => {
		let items = [
			{
				label: __( 'Domains' ),
				href: domainManagementList( selectedSite.slug, domain ),
			},
			{
				label: __( 'Use a domain I own' ),
				href: domainUseMyDomain( selectedSite.slug ),
			},
			{
				label: __( 'Transfer or connect' ),
				href: domainUseMyDomain( selectedSite.slug, domain ),
			},
			{ label: __( 'Connect' ) },
		];

		let mobileItem = {
			label: __( 'Back to transfer or connect' ),
			href: domainUseMyDomain( selectedSite.slug, domain ),
			showBackArrow: true,
		};

		if ( ! isFirstVisit ) {
			items = [
				{
					label: __( 'Domains' ),
					href: domainManagementList( selectedSite.slug, domain ),
				},
				{
					label: domain,
					href: domainManagementEdit( selectedSite.slug, domain ),
				},
				{ label: __( 'Connect' ) },
			];

			mobileItem = {
				label: __( 'Back' ),
				href: domainManagementEdit( selectedSite.slug, domain ),
				showBackArrow: true,
			};
		}

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const goBack = () => {
		if ( prevPageSlug ) {
			setPageSlug( prevPageSlug );
		} else {
			page( domainManagementList( selectedSite.slug ) );
		}
	};

	const renderTitle = () => {
		const headerText = sprintf(
			/* translators: %s: domain name being connected (ex.: example.com) */
			__( 'Connect %s' ),
			domain
		);

		return (
			<div className={ baseClassName + '__title' }>
				<FormattedHeader
					brandFont
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

	const renderContent = () => {
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
				/>
			</>
		);
	};

	const renderSidebar = () => {
		if ( ! isStepStart ) {
			return null;
		}
		return <DomainTransferRecommendation />;
	};

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'connect-domain-setup__body-white' ] } />
			{ renderBreadcrumbs() }
			{ renderTitle() }
			{ isTwoColumnLayout ? (
				<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
			) : (
				renderContent()
			) }
			<ConnectDomainStepSupportInfoLink baseClassName={ baseClassName } mode={ mode } />
			<ConnectDomainStepSwitchSetupInfoLink
				baseClassName={ baseClassName }
				currentMode={ mode }
				currentStep={ step }
				isSubdomain={ isSubdomain( domain ) }
				setPage={ setPageSlug }
			/>
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
};

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const siteId = selectedSite?.ID;

	return {
		domains: getDomainsBySiteId( state, siteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
		selectedSite,
	};
} )( ConnectDomainStep );
