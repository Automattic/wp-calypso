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

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
// TODO: replace this illustration with `client/assets/images/illustrations/domain-connected.svg` once #54685 is merged
import illustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';

function ConnectOption( { baseClassName, domain } ) {
	return <div className={ baseClassName + '__transfer-option' }></div>;
}

ConnectOption.propTypes = {
	baseClass: PropTypes.string.isRequired,
	domain: PropTypes.string,
};

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	( state ) => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
		productsList: getProductsList( state ),
		selectedSite: getSelectedSite( state ),
	} ),
	{ recordMappingButtonClickInUseYourDomain }
)( ConnectOption );
