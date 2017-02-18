/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import { connect } from 'react-redux';
import { find, get, has } from 'lodash';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';

//const wpcomRe = /^https?:\/\/[A-z_-]+\.wordpress\.com$/;
//
//function isWpcom( url ) {
//	return wpcomRe.test( url );
//}
//
//function addAdminPath( url ) {
//	return url + '/wp-admin';
//}

class BrowseHappy extends Component {
	static propTypes = {
		// connected props
		currentUser: PropTypes.object,
		selectedSite: PropTypes.object,
		primarySite: PropTypes.object,
	};

	realAdminUrl() {
		return get( this, find( [
			'props.selectedSite.options.admin_url',
			'props.primarySite.options.admin_url',
		], has.bind( null, this ) ) );
	}

	//guessedAdminUrl() {
	//	const primaryUrl = get( this.props, 'currentUser.primary_blog_url' );
	//	return primaryUrl && isWpcom( primaryUrl ) &&
	//		addAdminPath( primaryUrl );
	//}

	dashboardUrl() {
		return this.props.currentUser
			? 'https://dashboard.wordpress.com/wp-admin/'
			: 'https://dashboard.wordpress.com/wp-login.php';
	}

	render() {
		const adminUrl = this.realAdminUrl() ||
			//this.guessedAdminUrl() ||
			this.dashboardUrl();

		const title = i18n.translate( 'Unsupported Browser' );
		const line = i18n.translate(
			'Unfortunately this page cannot be used by your browser. You ' +
			'can either {{adminLink}}use the classic WordPress ' +
			'dashboard{{/adminLink}}, or {{browsehappyLink}}upgrade your ' +
			'browser{{/browsehappyLink}}.', {
				components: {
					adminLink: <a href={ adminUrl } />,
					browsehappyLink: <a href="http://browsehappy.com" />,
				}
			}
		);

		return (
			<Main className="browsehappy__main">
				<EmptyContent { ...{ title, line } } />
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const currentUser = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const primarySiteId = currentUser && currentUser.primary_blog;
		const primarySite = primarySiteId && getSite( state, primarySiteId );

		return {
			currentUser,
			selectedSite,
			primarySite,
		};
	}
)( BrowseHappy );

/*
import PageViewTracker from 'lib/analytics/page-view-tracker';
const analyticsPath = '/browsehapppy';
const analyticsPageTitle = 'Browsehappy';
<PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />
*/
