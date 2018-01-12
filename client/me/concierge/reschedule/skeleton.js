/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SitePlaceholder from 'blocks/site/placeholder';
import { localize } from 'i18n-calypso';

class Skeleton extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div>
				<CompactCard> { translate( 'Loading…' ) } </CompactCard>
				<CompactCard>
					<SitePlaceholder />
				</CompactCard>
			</div>
		);
	}
}

export default localize( Skeleton );
