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
import { isRequestingPostTypes } from 'state/post-types/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { requestPostTypes } from 'state/post-types/actions';

class QueryPostTypes extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostTypes: PropTypes.bool,
		themeSlug: PropTypes.string,
		postTypeSettings: PropTypes.object,
		requestPostTypes: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const {
			postTypeSettings,
			siteId,
			themeSlug
		} = this.props;
		const {
			postTypeSettings: nextPostTypeSettings,
			siteId: nextSiteId,
			themeSlug: nextThemeSlug
		} = nextProps;
		const hasThemeChanged = themeSlug && nextThemeSlug && themeSlug !== nextThemeSlug;
		const hasPostTypeSettingChanged = ! isEqual( postTypeSettings, nextPostTypeSettings );

		if ( siteId !== nextSiteId || hasThemeChanged || hasPostTypeSettingChanged ) {
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
		const settings = getSiteSettings( state, ownProps.siteId );

		return {
			postTypeSettings: pick( settings, [ 'jetpack_portfolio', 'jetpack_testimonial' ] ),
			requestingPostTypes: isRequestingPostTypes( state, ownProps.siteId ),
			themeSlug: getSiteOption( state, ownProps.siteId, 'theme_slug' )
		};
	},
	{ requestPostTypes }
)( QueryPostTypes );
