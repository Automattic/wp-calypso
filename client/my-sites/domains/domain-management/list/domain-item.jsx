/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

class DomainItem extends PureComponent {
	render() {
		return (
			<CompactCard>
				<div className="domain-item__link">
					<div className="domain-item__title">{ this.props.domain.domain }</div>
				</div>
			</CompactCard>
		);
	}
}

export default DomainItem;
