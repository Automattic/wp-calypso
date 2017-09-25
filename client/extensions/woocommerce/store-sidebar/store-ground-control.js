/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import Button from 'components/button';

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
				aria-label={ translate( 'Go back' ) }
			>
				<Gridicon icon="arrow-left" />
			</Button>
			<div className="store-sidebar__ground-control-site">
				<Site
					compact
					site={ site }
					indicator={ false }
					homeLink
					externalLink
				/>
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
