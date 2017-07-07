/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isDomainOnlySite } from 'state/selectors';
import { localize } from 'i18n-calypso';
import Notice from 'components/notice';

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
	domain: React.PropTypes.object.isRequired,
	isDomainOnly: React.PropTypes.bool,
	translate: React.PropTypes.func.isRequired,
};

export default connect( ( state ) => {
	return {
		isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) )
	};
} )( localize( DomainPrimaryFlag ) );
