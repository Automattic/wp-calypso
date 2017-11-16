/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { getSelectedSiteId } from 'state/ui/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';

class Show extends PureComponent {
	render() {
		const { siteId } = this.props;

		return (
			<p>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.props.translate( 'show!' ) }
			</p>
		);
	}
}

const mapStateToProps = state => {
	return {
		siteId: getSelectedSiteId( state ),
	};
};
const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( localize( Show ) );
