/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { filterStateToTokens, tokensToFilterState } from 'state/activity-log/utils';
import TokenField from 'components/token-field';
import { setFilter } from 'state/activity-log/actions';

class ActivityLogSearchTokens extends Component {
	static propTypes = {
		filter: PropTypes.object.isRequired,
	};

	onTokensChange = tokens => {
		this.props.setFilter( this.props.siteId, tokensToFilterState( tokens ) );
	};

	render() {
		const tokens = filterStateToTokens( this.props.filter );
		return <TokenField value={ tokens } onChange={ this.onTokensChange } />;
	}
}

export default connect(
	null,
	{ setFilter }
)( localize( ActivityLogSearchTokens ) );
