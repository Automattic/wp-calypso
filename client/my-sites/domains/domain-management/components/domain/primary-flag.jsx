/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { isDomainOnlySite } from 'client/state/selectors';
import { localize } from 'i18n-calypso';
import Notice from 'client/components/notice';

class DomainPrimaryFlag extends Component {
	render() {
		const { isDomainOnly, domain, translate } = this.props;

		if ( domain.isPrimary && ! isDomainOnly ) {
			return (
				<Notice isCompact status="is-success">
					{ translate( 'Primary Domain' ) }
				</Notice>
			);
		}

		return null;
	}
}

DomainPrimaryFlag.propTypes = {
	domain: PropTypes.object.isRequired,
	isDomainOnly: PropTypes.bool,
	translate: PropTypes.func.isRequired,
};

export default connect( state => {
	return {
		isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) ),
	};
} )( localize( DomainPrimaryFlag ) );
