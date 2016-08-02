/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPageTemplates } from 'state/page-templates/selectors';
import { requestPageTemplates } from 'state/page-templates/actions';

class QueryPageTemplates extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( ! props.isRequesting ) {
			props.requestPageTemplates( props.siteId );
		}
	}

	render() {
		return null;
	}
}

QueryPageTemplates.propTypes = {
	siteId: PropTypes.number.isRequired,
	isRequesting: PropTypes.bool,
	requestPageTemplates: PropTypes.func
};

export default connect(
	( state, { siteId } ) => {
		return {
			isRequesting: isRequestingPageTemplates( state, siteId )
		};
	},
	{ requestPageTemplates }
)( QueryPageTemplates );
