/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'blocks/site';
import { canCurrentUserUseCustomerHome } from 'state/sites/selectors';
import { getStatsDefaultSitePage } from 'lib/route/path';

const StoreGroundControl = ( { canUserUseCustomerHome, site, translate } ) => {
	const isPlaceholder = ! site;
	const siteSlug = get( site, 'slug', '' );
	const backDestination = canUserUseCustomerHome
		? `/home/${ siteSlug }`
		: getStatsDefaultSitePage( siteSlug );
	const backUrl = isPlaceholder ? '' : backDestination;

	return (
		<div className="store-sidebar__ground-control">
			<Button
				borderless
				className="store-sidebar__ground-control-back"
				disabled={ isPlaceholder }
				href={ backUrl }
				aria-label={ translate( 'Close Store' ) }
			>
				<Gridicon icon="cross" />
			</Button>
			<div className="store-sidebar__ground-control-site">
				<Site site={ site } indicator={ false } homeLink externalLink />
			</div>
		</div>
	);
};

StoreGroundControl.propTypes = {
	canUserUseCustomerHome: PropTypes.bool.isRequired,
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( state => ( {
	canUserUseCustomerHome: canCurrentUserUseCustomerHome( state ),
} ) )( localize( StoreGroundControl ) );
