/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSharingButtons } from 'state/selectors';
import { requestSharingButtons } from 'state/sites/sharing-buttons/actions';

class QuerySharingButtons extends Component {
	componentWillMount() {
		this.requestSettings( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestSettings( nextProps );
	}

	requestSettings( props ) {
		const { requestingSharingButtons, siteId } = props;
		if ( ! requestingSharingButtons && siteId ) {
			props.requestSharingButtons( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySharingButtons.propTypes = {
	siteId: PropTypes.number,
	requestingSharingButtons: PropTypes.bool,
	requestSharingButtons: PropTypes.func
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSharingButtons: isRequestingSharingButtons( state, siteId )
		};
	},
	{ requestSharingButtons }
)( QuerySharingButtons );
