/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from '@automattic/components/card/compact';
import { localize } from 'i18n-calypso';

class Skeleton extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div>
				<CompactCard> { translate( 'Loading…' ) } </CompactCard>
			</div>
		);
	}
}

export default localize( Skeleton );
