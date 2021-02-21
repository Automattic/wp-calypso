/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestJetpackProductInstallStatus } from 'calypso/state/jetpack-product-install/actions';

class QueryJetpackProductInstallStatus extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	componentDidMount() {
		this.props.requestJetpackProductInstallStatus( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.props.requestJetpackProductInstallStatus( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	requestJetpackProductInstallStatus,
} )( QueryJetpackProductInstallStatus );
