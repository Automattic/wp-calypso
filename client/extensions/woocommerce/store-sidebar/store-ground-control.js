/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'blocks/site';
import { getMySitesDefaultPage } from 'state/sites/selectors';

const StoreGroundControl = ( { site, mySitesDefaultPage, translate } ) => {
	const isPlaceholder = ! site;
	const backUrl = isPlaceholder ? '' : mySitesDefaultPage;

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
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ).isRequired,
	mySitesDefaultPage: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( state => ( {
	mySitesDefaultPage: getMySitesDefaultPage( state ),
} ) )( localize( StoreGroundControl ) );
