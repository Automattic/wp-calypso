/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPlugins } from '../../../state/plugins/selectors';
import { requestPlugins } from '../../../state/plugins/actions';

class QueryPlugins extends Component {
	UNSAFE_componentWillMount() {
		this.requestPlugins( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestPlugins( nextProps );
	}

	requestPlugins( props ) {
		const { requestingPlugins, siteId } = props;

		if ( ! requestingPlugins && siteId ) {
			props.requestPlugins( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryPlugins.propTypes = {
	siteId: PropTypes.number,
	requestingPlugins: PropTypes.bool,
	requestPlugins: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingPlugins: isRequestingPlugins( state, siteId ),
		};
	},
	{ requestPlugins }
)( QueryPlugins );
