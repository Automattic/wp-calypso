/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	fetchEmailSettings,
} from 'woocommerce/state/sites/settings/email/actions';

class Settings extends React.Component {

	componentDidMount = () => {
		const { siteId, fetchEmailSettings: fetch } = this.props;
		siteId && fetch( siteId );
	};

	componentWillReceiveProps = newProps => {
		if ( newProps.siteId === this.props.siteId ) {
			return;
		}

		const { siteId, fetchEmailSettings: fetch } = newProps;
		siteId && fetch( siteId );
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		return (
			<div className="email-settings__container">
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

Settings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchEmailSettings,
		},
		dispatch
	);
}

export default connect( null, mapDispatchToProps )( localize( Settings ) );
