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

const StoreGroundControl = ( { onBack, site, translate } ) => {
	return (
		<div className="store-sidebar__ground-control">
			<Button
				borderless
				className="store-sidebar__ground-control-back"
				href={ '' }
				onClick={ onBack }
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
	onBack: React.PropTypes.function,
	site: React.PropTypes.object,
};

export default localize( StoreGroundControl );
