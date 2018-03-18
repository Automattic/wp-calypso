/** @format */
/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isDomainOnlySite } from 'state/selectors';
import { localize } from 'i18n-calypso';

const DomainPrimaryFlag = ( { isDomainOnly, domain, translate } ) => {
	if ( domain.isPrimary && ! isDomainOnly ) {
		return <strong className="domain__primary-flag">{ translate( 'Primary Domain' ) }</strong>;
	}

	return null;
};

DomainPrimaryFlag.propTypes = {
	domain: PropTypes.object.isRequired,
	isDomainOnly: PropTypes.bool,
	translate: PropTypes.func.isRequired,
};

export default flow(
	localize,
	connect( state => ( {
		isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) ),
	} ) )
)( DomainPrimaryFlag );
