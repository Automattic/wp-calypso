/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { SetupPath } from '../constants';
import { getSiteSlug } from 'state/sites/selectors';
import { isFetchingSetupStatus, shouldShowSetupWizard } from '../../../state/setup/selectors';
import QuerySetupStatus from '../../data/query-setup-status';

class SetupRedirect extends Component {
	static propTypes = {
		isFetching: PropTypes.bool,
		showWizard: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
	}

	componentWillReceiveProps( { isFetching, showWizard, siteSlug } ) {
		if ( this.props.isFetching && ! isFetching && showWizard ) {
			page.redirect( `${ SetupPath }/${ siteSlug }` );
		}
	}

	render() {
		const { siteId } = this.props;

		if ( ! siteId ) {
			return null;
		}

		return (
			<QuerySetupStatus siteId={ siteId } />
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isFetching: isFetchingSetupStatus( state, siteId ),
		showWizard: shouldShowSetupWizard( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	} )
)( SetupRedirect );
