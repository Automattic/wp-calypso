/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

class ListItem extends PureComponent {
	render() {
		return (
			<CompactCard>
				<div className="all__item-link">
					<div className="all__item-title">{ this.props.domain.domain }</div>
				</div>
			</CompactCard>
		);
	}
}

export default ListItem;
