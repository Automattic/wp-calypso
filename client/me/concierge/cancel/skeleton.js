import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

class Skeleton extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div>
				<CompactCard> { translate( 'Cancelling your Quick Start session…' ) } </CompactCard>
			</div>
		);
	}
}

export default localize( Skeleton );
