/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { requestPostTypes } from 'calypso/state/post-types/actions';

// list of site settings properties that trigger a new query when they change
const POST_TYPE_SETTINGS = [ 'jetpack_portfolio', 'jetpack_testimonial' ];

class QueryPostTypes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostTypes: PropTypes.bool,
		themeSlug: PropTypes.string,
		postTypeSettings: PropTypes.object,
		requestPostTypes: PropTypes.func,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteSettings, siteId, themeSlug } = this.props;
		const {
			siteSettings: nextSiteSettings,
			siteId: nextSiteId,
			themeSlug: nextThemeSlug,
		} = nextProps;

		const hasThemeChanged = themeSlug && nextThemeSlug && themeSlug !== nextThemeSlug;
		const hasPostTypeSettingChanged = ! isEqual(
			pick( siteSettings, POST_TYPE_SETTINGS ),
			pick( nextSiteSettings, POST_TYPE_SETTINGS )
		);

		if ( siteId !== nextSiteId || hasThemeChanged || hasPostTypeSettingChanged ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		props.requestPostTypes( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteSettings: getSiteSettings( state, siteId ),
		themeSlug: getSiteOption( state, siteId, 'theme_slug' ),
	} ),
	{ requestPostTypes }
)( QueryPostTypes );
