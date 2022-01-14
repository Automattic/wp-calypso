import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { fetchPlugins } from 'calypso/state/plugins/installed/actions';
import { isRequestingForSites } from 'calypso/state/plugins/installed/selectors';

class QueryJetpackPlugins extends Component {
	static propTypes = {
		siteIds: PropTypes.arrayOf(
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired
		).isRequired,
		isRequestingForSites: PropTypes.bool,
		fetchPlugins: PropTypes.func,
	};

	componentDidMount() {
		if ( this.props.siteIds && ! this.props.isRequestingForSites ) {
			this.props.fetchPlugins( this.props.siteIds );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( isEqual( prevProps.siteIds, this.props.siteIds ) ) {
			return;
		}
		this.refresh( prevProps.isRequestingForSites, prevProps.siteIds );
	}

	refresh( isRequesting, siteIds ) {
		if ( ! isRequesting ) {
			this.props.fetchPlugins( siteIds );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, props ) => {
		return {
			isRequestingForSites: isRequestingForSites( state, props.siteIds ),
		};
	},
	{ fetchPlugins }
)( QueryJetpackPlugins );
