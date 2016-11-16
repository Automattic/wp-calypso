/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingConfig } from 'state/ui/olark/selectors';
import { fetchOlarkConfig } from 'state/ui/olark/actions';
import { OLARK_CONFIG_CONTEXTS } from 'lib/olark/constants';
import config from 'config';

class QueryOlarkConfig extends Component {
	componentWillMount() {
		if ( this.props.isRequesting ) {
			return;
		}

		const clientSlug = config( 'client_slug' );

		this.props.fetchOlarkConfig( clientSlug, this.props.supportContext );
	}

	render() {
		return null;
	}
}

QueryOlarkConfig.propTypes = {
	supportContext: PropTypes.oneOf( values( OLARK_CONFIG_CONTEXTS ) ).isRequired,
	isRequesting: PropTypes.bool,
};

export default connect(
	( state, { supportContext } ) => {
		return {
			isRequesting: isRequestingConfig( state, supportContext ),
		};
	},
	{ fetchOlarkConfig }
)( QueryOlarkConfig );
