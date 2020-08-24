/**
 * High order component that helps us allow only Jetpack sites.
 * - Redirects to `/plans/my-plan/:site` if the current site is not a Jetpack site.
 * - Redirects to `/jetpack/connect` if the current site is invalid or not set.
 * - Will not render the wrapped component if the site is not a valid Jetpack site.
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const jetpackOnly = ( WrappedComponent ) => {
	class JetpackOnlyWrapper extends Component {
		componentDidMount() {
			this.verifyJetpackSite();
		}

		verifyJetpackSite() {
			const { notJetpack, siteId, siteSlug } = this.props;

			if ( notJetpack ) {
				// Redirect to My Plan page if this is not a Jetpack site
				page.redirect( `/plans/my-plan/${ siteSlug }` );
			} else if ( ! siteId ) {
				// Redirect to /jetpack/connect if this is not a valid connected site
				page.redirect( `/jetpack/connect` );
			}
		}

		render() {
			const { notJetpack, siteId } = this.props;

			if ( notJetpack || ! siteId ) {
				return null;
			}

			return <WrappedComponent { ...this.props } />;
		}
	}

	return connect( ( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			notJetpack: siteId && ! isJetpackSite( state, siteId ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	} )( JetpackOnlyWrapper );
};

export default jetpackOnly;
