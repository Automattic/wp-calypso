/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, map, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import getJetpackOnboardingSettings from 'state/selectors/get-jetpack-onboarding-settings';
import { isJetpackSite } from 'state/sites/selectors';

const NextSteps = ( { onClick, siteId, steps } ) => (
	<Fragment>
		<QuerySites siteId={ siteId } />
		{ map( steps, ( { label, url }, stepName ) => (
			<div key={ stepName } className="jetpack-onboarding__summary-entry todo">
				<a href={ url } onClick={ onClick( stepName, 'next' ) }>
					{ label }
				</a>
			</div>
		) ) }
	</Fragment>
);

NextSteps.propTypes = {
	onClick: PropTypes.func,
};

NextSteps.defaultProps = {
	onClick: noop,
};

export default localize(
	connect( ( state, { siteId, siteSlug, siteUrl, translate } ) => {
		const isConnected = isJetpackSite( state, siteId ); // Will only return true if the site is connected to WP.com
		const settings = getJetpackOnboardingSettings( state, siteId );
		const additionalSteps = {};
		const isBusiness = get( settings, 'siteType' ) === 'business';
		const wantsWoo = get( settings, 'installWooCommerce' ) === true;

		if ( isBusiness && wantsWoo ) {
			additionalSteps.STORE = {
				label: translate( 'Set up your store' ),
				url: siteUrl + '/wp-admin/index.php?page=wc-setup',
			};
		}

		if ( isConnected ) {
			return {
				steps: {
					theme: {
						label: translate( 'Choose a Theme' ),
						url: '/themes/' + siteSlug,
					},
					pages: {
						label: translate( 'Add additional pages' ),
						url: getEditorNewPostPath( state, siteId, 'page' ),
					},
					blog: {
						label: translate( 'Write your first blog post' ),
						url: getEditorNewPostPath( state, siteId, 'post' ),
					},
					...additionalSteps,
				},
			};
		}

		return {
			steps: {
				'jetpack-connect': {
					label: translate( 'Connect to WordPress.com' ),
					url: '/jetpack/connect?url=' + siteUrl,
				},
				theme: {
					label: translate( 'Choose a Theme' ),
					url: siteUrl + '/wp-admin/theme-install.php?browse=featured',
				},
				pages: {
					label: translate( 'Add additional pages' ),
					url: siteUrl + '/wp-admin/post-new.php?post_type=page',
				},
				blog: {
					label: translate( 'Write your first blog post' ),
					url: siteUrl + '/wp-admin/post-new.php',
				},
				...additionalSteps,
			},
		};
	} )( NextSteps )
);
