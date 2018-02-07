/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import { isJetpackSite } from 'state/sites/selectors';

// We discard all other props in connect() to make sure the component only receives step objects.
const NextSteps = steps =>
	map( steps, ( { label, url }, stepName ) => (
		<div key={ stepName } className="steps__summary-entry todo">
			<a href={ url }>{ label }</a>
		</div>
	) );

export default localize(
	connect(
		( state, { siteId, siteSlug, siteUrl, translate } ) => {
			const isConnected = isJetpackSite( state, siteId ); // Will only return true if the site is connected to WP.com
			if ( isConnected ) {
				return {
					THEME: {
						label: translate( 'Choose a Theme' ),
						url: '/themes/' + siteSlug,
					},
					PAGES: {
						label: translate( 'Add additional pages' ),
						url: getEditorNewPostPath( state, siteId, 'page' ),
					},
					BLOG: {
						label: translate( 'Write your first blog post' ),
						url: getEditorNewPostPath( state, siteId, 'post' ),
					},
				};
			}

			return {
				JETPACK_CONNECTION: {
					label: translate( 'Connect to WordPress.com' ),
					url: '/jetpack/connect?url=' + siteUrl,
				},
				THEME: {
					label: translate( 'Choose a Theme' ),
					url: siteUrl + '/wp-admin/theme-install.php?browse=featured',
				},
				PAGES: {
					label: translate( 'Add additional pages' ),
					url: siteUrl + '/wp-admin/post-new.php?post_type=page',
				},
				BLOG: {
					label: translate( 'Write your first blog post' ),
					url: siteUrl + '/wp-admin/post-new.php',
				},
			};
		},
		null,
		stateProps => stateProps // Discard ownProps
	)( NextSteps )
);
