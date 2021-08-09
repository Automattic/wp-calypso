/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { connect } from 'react-redux';
import { Card, Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	DOMAINS_WITH_PLANS_ONLY,
	NON_PRIMARY_DOMAINS_TO_FREE_USERS,
} from 'calypso/state/current-user/constants';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/landing/gutenboarding/stores/onboard/selectors';
import OptionContent from './option-content';
import { INCOMING_DOMAIN_TRANSFER } from 'calypso/lib/url/support';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import transferIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';

const transferContent = {
	transferSupported: {
		illustration: transferIllustration,
		titleText: __( 'Transfer your domain' ),
		topText: __( 'Manage your domain directly on WordPress.com' ),
		recommended: true,
		learnMoreLink: INCOMING_DOMAIN_TRANSFER,
		benefits: [
			__( 'Manage everything you need in one place' ),
			__( "We'll renew your domain for another year" ),
			__( 'Private domain registration and SSL certificate included for free' ),
		],
		pricing: {
			color: 'green',
			text: __( 'Free transfer with your plan' ),
			cost: '$18/year renewal',
		},
		primary: true,
		onSelect: () => {},
	},
};

function TransferOption( { domain } ) {
	const content = transferContent.transferSupported;

	return <OptionContent { ...content } />;
}

TransferOption.propTypes = {
	domain: PropTypes.string.isRequired,
};

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
		productsList: getProductsList( state ),
		selectedSite: getSelectedSite( state ),
	} ),
	{ recordTransferButtonClickInUseYourDomain }
)( TransferOption );
