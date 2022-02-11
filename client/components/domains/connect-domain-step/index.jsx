import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import ConnectDomainStepSupportInfoLink from 'calypso/components/domains/connect-domain-step/connect-domain-step-support-info-link';
import DomainTransferRecommendation from 'calypso/components/domains/domain-transfer-recommendation';
import FormattedHeader from 'calypso/components/formatted-header';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import wpcom from 'calypso/lib/wp';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementList, domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepSwitchSetupInfoLink from './connect-domain-step-switch-setup-info-link';
import { isMappingVerificationSuccess } from './connect-domain-step-verification-status-parsing.js';
import ConnectDomainSteps from './connect-domain-steps';
import { modeType, stepType, stepSlug, defaultDomainSetupInfo } from './constants';
import { connectADomainStepsDefinition } from './page-definitions.js';

import './style.scss';

function ConnectDomainStep( { domain, selectedSite, initialSetupInfo, initialStep, showErrors } ) {
	const { __ } = useI18n();
	const [ pageSlug, setPageSlug ] = useState( stepSlug.SUGGESTED_START );
	const [ verificationStatus, setVerificationStatus ] = useState( {} );
	const [ verificationInProgress, setVerificationInProgress ] = useState( false );
	const [ domainSetupInfo, setDomainSetupInfo ] = useState( defaultDomainSetupInfo );
	const [ domainSetupInfoError, setDomainSetupInfoError ] = useState( {} );
	const [ loadingDomainSetupInfo, setLoadingDomainSetupInfo ] = useState( false );

	const baseClassName = 'connect-domain-step';
	const isStepStart = stepType.START === connectADomainStepsDefinition[ pageSlug ].step;
	const mode = connectADomainStepsDefinition[ pageSlug ].mode;
	const step = connectADomainStepsDefinition[ pageSlug ].step;

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

			const connectedSlug =
				modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_CONNECTED : stepSlug.ADVANCED_CONNECTED;
			const verifyingSlug =
				modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_VERIFYING : stepSlug.ADVANCED_VERIFYING;

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
		const items = [
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

		const mobileItem = {
			label: __( 'Back to transfer or connect' ),
			href: domainUseMyDomain( selectedSite.slug, domain ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const goBack = () => {
		const prevPageSlug = connectADomainStepsDefinition[ pageSlug ]?.prev;

		if ( prevPageSlug ) {
			setPageSlug( prevPageSlug );
		} else {
			page( domainManagementList( selectedSite.slug ) );
		}
	};

	const headerText = sprintf(
		/* translators: %s: domain name being connected (ex.: example.com) */
		__( 'Connect %s' ),
		domain
	);

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'connect-domain-setup__body-white' ] } />
			{ renderBreadcrumbs() }
			<BackButton className={ baseClassName + '__go-back' } onClick={ goBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ headerText }
				align="left"
			/>
			<ConnectDomainSteps
				baseClassName={ baseClassName }
				domain={ domain }
				initialPageSlug={ pageSlug }
				stepsDefinition={ connectADomainStepsDefinition }
				onSetPage={ setPageSlug }
				onVerifyConnection={ verifyConnection }
				verificationInProgress={ verificationInProgress }
				verificationStatus={ verificationStatus || {} }
				domainSetupInfo={ domainSetupInfo }
				domainSetupInfoError={ domainSetupInfoError }
				showErrors={ showErrors }
			/>
			{ isStepStart && <DomainTransferRecommendation /> }
			<ConnectDomainStepSupportInfoLink baseClassName={ baseClassName } mode={ mode } />
			<ConnectDomainStepSwitchSetupInfoLink
				baseClassName={ baseClassName }
				currentMode={ mode }
				currentStep={ step }
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
