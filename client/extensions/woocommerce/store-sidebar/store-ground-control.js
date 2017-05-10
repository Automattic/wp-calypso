/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
const Gridicon = require( 'gridicons' ),
	Site = require( 'blocks/site' );

import Button from 'components/button';

const StoreGroundControl = ( { site, translate } ) => {
	const backLink = '/stats/day/' + site.slug;

	return (
		<div className="store-sidebar__ground-control">
			<Button
				borderless
				className="store-sidebar__ground-control-back"
				href={ backLink }
				aria-label={ translate( 'Go back' ) }
			>
				<Gridicon icon="arrow-left" />
			</Button>
			<div className="store-sidebar__ground-control-site">
				<Site
					compact
					site={ site }
					indicator={ false }
					homeLink={ true }
					externalLink={ true }
				/>
			</div>
		</div>
	);
};

StoreGroundControl.propTypes = {
	site: React.PropTypes.shape( {
		slug: React.PropTypes.string.isRequired,
	} ),
};

export default localize( StoreGroundControl );
