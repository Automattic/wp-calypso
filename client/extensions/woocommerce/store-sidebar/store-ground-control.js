/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Site from 'blocks/site';

const StoreGroundControl = ( { site, translate } ) => {
	const isPlaceholder = ! site;
	const backLink = isPlaceholder ? '' : '/stats/day/' + site.slug;

	return (
		<div className="store-sidebar__ground-control">
			<Button
				borderless
				className="store-sidebar__ground-control-back"
				disabled={ isPlaceholder }
				href={ backLink }
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
	} ),
};

export default localize( StoreGroundControl );
