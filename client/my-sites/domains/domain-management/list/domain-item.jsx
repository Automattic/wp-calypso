/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

class DomainItem extends PureComponent {
	handleClick = () => {
		this.props.onClick( this.props.domain );
	};

	render() {
		return (
			<CompactCard className={ 'domain-item' } onClick={ this.handleClick }>
				<div className="domain-item__link">
					<div className="domain-item__title">{ this.props.domain.domain }</div>
				</div>
			</CompactCard>
		);
	}
}

export default DomainItem;
