/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getSiteSetting from 'state/selectors/get-site-setting';
import { updateSiteSettings } from 'state/site-settings/actions';
import { getSiteOption } from 'state/sites/selectors';

class QuerySiteFrontPage extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	componentDidMount() {
		const { showOnFrontSetting, pageOnFrontSetting } = this.props;
		if ( showOnFrontSetting && pageOnFrontSetting ) {
			return;
		}

		this.setFrontPageSettings();
	}

	componentDidUpdate( { showOnFrontSetting, pageOnFrontSetting } ) {
		if ( showOnFrontSetting && pageOnFrontSetting ) {
			return;
		}

		this.setFrontPageSettings();
	}

	setFrontPageSettings() {
		const { showOnFrontOption, pageOnFrontOption, pageForPostsOption, updateSettings } = this.props;

		updateSettings( {
			show_on_front: showOnFrontOption,
			page_for_posts: parseInt( pageOnFrontOption, 10 ),
			page_on_front: parseInt( pageForPostsOption, 10 ),
		} );
	}

	render() {
		return null;
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	showOnFrontOption: getSiteOption( state, siteId, 'show_on_front' ),
	pageOnFrontOption: getSiteOption( state, siteId, 'page_on_front' ),
	pageForPostsOption: getSiteOption( state, siteId, 'page_for_posts' ),

	showOnFrontSetting: getSiteSetting( state, siteId, 'show_on_front' ),
	pageOnFrontSetting: getSiteSetting( state, siteId, 'page_on_front' ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	updateSettings: settings => dispatch( updateSiteSettings( siteId, settings ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( QuerySiteFrontPage );
