/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPostTypes } from 'state/post-types/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { requestPostTypes } from 'state/post-types/actions';

class QueryPostTypes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostTypes: PropTypes.bool,
		themeSlug: PropTypes.string,
		requestPostTypes: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, themeSlug } = this.props;
		const { siteId: nextSiteId, themeSlug: nextThemeSlug } = nextProps;
		const hasThemeChanged = themeSlug && nextThemeSlug && themeSlug !== nextThemeSlug;
		if ( siteId !== nextSiteId || hasThemeChanged ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingPostTypes ) {
			return;
		}

		props.requestPostTypes( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingPostTypes: isRequestingPostTypes( state, ownProps.siteId ),
			themeSlug: getSiteOption( state, ownProps.siteId, 'theme_slug' )
		};
	},
	{ requestPostTypes }
)( QueryPostTypes );
