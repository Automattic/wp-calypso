/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

class Skeleton extends Component {
	render() {
		return (
			<div>
				<CompactCard> { 'Cancelling your Concierge session…' } </CompactCard>
			</div>
		);
	}
}

export default Skeleton;
