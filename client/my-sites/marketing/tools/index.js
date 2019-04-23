/** @format */

/**
 * External dependencies
 */
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

function MarketingTools( { translate } ) {
	return (
		<Card>
			{ translate( 'Drive more traffic to your site with our SEO tools' ) }
		</Card>
	);
}

MarketingTools.propTypes = {
	translate: PropTypes.func,
};

MarketingTools.defaultProps = {
	translate: identity,
};

export default localize( MarketingTools );
