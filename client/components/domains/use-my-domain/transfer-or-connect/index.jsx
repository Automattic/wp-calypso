import { Card } from '@automattic/components';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import wpcom from 'calypso/lib/wp';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	getDomainInboundTransferStatusInfo,
	getOptionInfo,
	connectDomainAction,
} from '../utilities';
import OptionContent from './option-content';

import './style.scss';

function DomainTransferOrConnect( {
	availability,
	cart,
	currencyCode,
	defaultConnectHandler,
	domain,
	domainInboundTransferStatusInfo,
	isSignupStep,
	onConnect,
	onSkip,
	onTransfer,
	primaryWithPlansOnly,
	productsList,
	recordMappingButtonClickInUseYourDomain,
	recordTransferButtonClickInUseYourDomain,
	selectedSite,
	siteIsOnPaidPlan,
	transferDomainUrl,
} ) {
	const [ actionClicked, setActionClicked ] = useState( false );
	const [ availabilityData, setAvailabilityData ] = useState( availability );
	const [ inboundTransferStatusInfo, setInboundTransferStatusInfo ] = useState(
		domainInboundTransferStatusInfo
	);
	const [ isFetching, setIsFetching ] = useState( false );

	const { setShowHelpCenter, setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );

	const handleConnect = () => {
		recordMappingButtonClickInUseYourDomain( domain );
		setActionClicked( true );

		const connectHandler = onConnect ?? defaultConnectHandler;
		connectHandler( { domain, selectedSite }, () => setActionClicked( false ) );
	};

	const handleTransfer = () => {
		recordTransferButtonClickInUseYourDomain( domain );
		setActionClicked( true );

		onTransfer( { domain, selectedSite, transferDomainUrl }, () => setActionClicked( false ) );
	};

	const content = getOptionInfo( {
		availability: availabilityData,
		cart,
		currencyCode,
		domain,
		domainInboundTransferStatusInfo: inboundTransferStatusInfo,
		isSignupStep,
		onConnect: handleConnect,
		onSkip,
		onTransfer: handleTransfer,
		primaryWithPlansOnly,
		productsList,
		selectedSite,
		siteIsOnPaidPlan,
		transferDomainUrl,
	} );

	// retrieves the availability data by itself if not provided by the parent component
	useEffect( () => {
		( async () => {
			if ( ( availabilityData && inboundTransferStatusInfo ) || isFetching ) {
				return;
			}

			try {
				setIsFetching( true );
				if ( ! availabilityData ) {
					const retrievedAvailabilityData = await wpcom.domain( domain ).isAvailable( {
						apiVersion: '1.3',
						blog_id: selectedSite?.ID,
						is_cart_pre_check: false,
					} );

					setAvailabilityData( retrievedAvailabilityData );
				}
			} catch {
				setAvailabilityData( {} );
			}

			try {
				if ( ! inboundTransferStatusInfo ) {
					const inboundTransferStatusResult = await getDomainInboundTransferStatusInfo( domain );
					setInboundTransferStatusInfo( inboundTransferStatusResult );
				}
			} catch {
				setInboundTransferStatusInfo( {} );
			} finally {
				setIsFetching( false );
			}
		} )();
	}, [ availabilityData, domain, inboundTransferStatusInfo, isFetching, selectedSite?.ID ] );

	const baseClassName = 'domain-transfer-or-connect';

	return (
		<>
			<QueryProductsList />
			<Card className={ baseClassName + '__content' }>
				{ content.map( ( optionProps, index ) => (
					<OptionContent
						isPlaceholder={ isFetching }
						key={ 'option-' + index }
						disabled={ actionClicked }
						{ ...optionProps }
					/>
				) ) }
				{ ! isFetching && (
					<div className={ baseClassName + '__support-link' }>
						{ createInterpolateElement(
							__( "Not sure what's best for you? <a>We're happy to help!</a>" ),
							{
								a: createElement( 'button', {
									onClick: () => {
										setNavigateToRoute( '/odie' );
										setShowHelpCenter( true );
									},
								} ),
							}
						) }
					</div>
				) }
			</Card>
		</>
	);
}

DomainTransferOrConnect.propTypes = {
	availability: PropTypes.object.isRequired,
	defaultConnectHandler: PropTypes.func,
	defaultTransferHandler: PropTypes.func,
	domain: PropTypes.string.isRequired,
	isSignupStep: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	selectedSite: PropTypes.object,
	transferDomainUrl: PropTypes.string,
};

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
			productsList: getProductsList( state ),
			selectedSite,
			siteIsOnPaidPlan: isSiteOnPaidPlan( state, selectedSite?.ID ),
		};
	},
	{
		defaultConnectHandler: connectDomainAction,
		recordTransferButtonClickInUseYourDomain,
		recordMappingButtonClickInUseYourDomain,
	}
)( withCartKey( withShoppingCart( DomainTransferOrConnect ) ) );
