/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import vendorOlark from 'lib/olark-api/vendor-olark';
import { OLARK_CONFIG_CONTEXTS } from 'lib/olark/constants';
import { getOlarkConfigOptions } from 'state/ui/olark/selectors';
import { setOperatorsAvailable, setOperatorsAway } from 'state/ui/olark/actions';
import olarkActions from 'lib/olark-store/actions';

class QueryOlarkOperatorStatus extends Component {
	componentDidMount() {
		this.loadOlark();
	}

	componentDidUpdate() {
		this.loadOlark();
	}

	loadOlark() {
		if ( ! this.isReady() ) {
			return;
		}

		if ( this.iframe ) {
			return;
		}

		const { iframe } = this.refs;
		const { config } = this.props;
		const iframeWindow = iframe.contentWindow || iframe;

		vendorOlark( iframeWindow );

		const iframedOlark = iframeWindow.olark;

		iframedOlark( 'api.chat.onOperatorsAway', () => {
			this.props.setOperatorsAway();
			olarkActions.setOperatorsAway();
		} );
		iframedOlark( 'api.chat.onOperatorsAvailable', () => {
			this.props.setOperatorsAvailable();
			olarkActions.setOperatorsAvailable();
		} );
		iframedOlark( 'api.chat.setOperatorGroup', { group: config.group } );

		iframedOlark( 'api.chat.onReady', () => {
		} );

		iframedOlark.identify( config.identity );

		this.iframe = iframe;
	}

	isReady() {
		return !! this.props.config;
	}

	render() {
		return <iframe
			ref="iframe"
			src="about:blank"
			sandbox="allow-scripts allow-same-origin" />;
	}
}

QueryOlarkOperatorStatus.propTypes = {
	supportContext: PropTypes.oneOf( values( OLARK_CONFIG_CONTEXTS ) ),
};

export default connect(
	( state, { supportContext } ) => {
		return {
			config: getOlarkConfigOptions( state, supportContext ),
		};
	},
	{ setOperatorsAvailable, setOperatorsAway }
)( QueryOlarkOperatorStatus );
