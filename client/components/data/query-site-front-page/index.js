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
		if ( this.props.showOnFrontSetting ) {
			return;
		}
		this.setFrontPageSettings();
	}

	componentDidUpdate() {
		if ( this.props.showOnFrontSetting ) {
			return;
		}
		this.setFrontPageSettings();
	}

	setFrontPageSettings() {
		const { showOnFrontOption, pageOnFrontOption, pageForPostsOption, updateSettings } = this.props;
		updateSettings( {
			show_on_front: showOnFrontOption,
			page_for_posts: pageOnFrontOption,
			page_on_front: pageForPostsOption,
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
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	updateSettings: settings => dispatch( updateSiteSettings( siteId, settings ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( QuerySiteFrontPage );
