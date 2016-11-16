/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getOlarkConfig, isRequestingConfig } from 'state/ui/olark/selectors';
import { fetchOlarkConfig } from 'state/ui/olark/actions';
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
	supportContext: PropTypes.string.isRequired,
	isRequesting: PropTypes.bool,
	config: PropTypes.object,
};

export default connect(
	( state, { supportContext } ) => {
		return {
			config: getOlarkConfig( state, supportContext ),
			isRequesting: isRequestingConfig( state, supportContext ),
		};
	},
	{ fetchOlarkConfig }
)( QueryOlarkConfig );
