/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { values, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import QueryOlarkConfig from 'components/data/query-olark-config';
import { getOlarkConfigOptions } from 'state/ui/olark/selectors';
import { OLARK_CONFIG_CONTEXTS } from 'lib/olark/constants';
import olarkActions from 'lib/olark-store/actions';
import olark from 'lib/olark';

class OlarkConfigContext extends Component {
	componentWillMount() {
		this.updateOlarkConfig();
	}

	componentDidUpdate() {
		this.updateOlarkConfig();
	}

	shouldComponentUpdate( nextProps ) {
		// Only update the component if a property in the props has changed. Don't care if
		// the actual object has changed. Primary concern here is this.props.config
		return ! isEqual( nextProps, this.props );
	}

	updateOlarkConfig() {
		const { config } = this.props;

		if ( ! config ) {
			return;
		}

		olark.setOlarkGroupAndEligibility( config );
		olarkActions.tickle();
	}

	render() {
		return <QueryOlarkConfig supportContext={ this.props.supportContext } />;
	}
}

OlarkConfigContext.propTypes = {
	supportContext: PropTypes.oneOf( values( OLARK_CONFIG_CONTEXTS ) ),
};

export default connect(
	( state, { supportContext } ) => {
		return {
			config: getOlarkConfigOptions( state, supportContext ),
		};
	}
)( OlarkConfigContext );
