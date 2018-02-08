/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const NextSteps = ( { siteId, steps } ) => (
	<Fragment>
		<QuerySites siteId={ siteId } />
		{ map( steps, ( { label, url }, stepName ) => (
			<div key={ stepName } className="jetpack-onboarding__summary-entry todo">
				<a href={ url }>{ label }</a>
			</div>
		) ) }
	</Fragment>
);

export default localize(
	connect( ( state, { siteId, siteSlug, siteUrl, translate } ) => {
		const isConnected = isJetpackSite( state, siteId ); // Will only return true if the site is connected to WP.com
		if ( isConnected ) {
			return {
				steps: {
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
				},
			};
		}

		return {
			steps: {
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
			},
		};
	} )( NextSteps )
);
