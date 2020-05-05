/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPageTemplates } from 'state/page-templates/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { requestPageTemplates } from 'state/page-templates/actions';

class QueryPageTemplates extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId, themeSlug } = this.props;
		const { siteId: nextSiteId, themeSlug: nextThemeSlug } = nextProps;
		const hasSiteOrThemeChanged =
			siteId !== nextSiteId || ( themeSlug && nextThemeSlug && themeSlug !== nextThemeSlug );

		if ( hasSiteOrThemeChanged ) {
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
	requestPageTemplates: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			isRequesting: isRequestingPageTemplates( state, siteId ),
			themeSlug: getSiteOption( state, siteId, 'theme_slug' ),
		};
	},
	{ requestPageTemplates }
)( QueryPageTemplates );
