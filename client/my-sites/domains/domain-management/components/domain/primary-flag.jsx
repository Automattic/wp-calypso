/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { isDomainOnlySite } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class DomainPrimaryFlag extends Component {
	render() {
		const { isDomainOnly, domain, translate } = this.props;

		if ( domain.isPrimary && ! isDomainOnly ) {
			return (
				<Notice isCompact status="is-success">{ translate( 'Primary Domain' ) }</Notice>
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

export default connect( ( state ) => {
	return {
		isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) )
	};
} )( localize( DomainPrimaryFlag ) );
