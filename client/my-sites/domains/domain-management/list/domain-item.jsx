/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';

class DomainItem extends PureComponent {
	handleClick = () => {
		this.props.onClick( this.props.domain );
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = () => {
		// TODO
	};

	render() {
		return (
			<CompactCard className="domain-item" onClick={ this.handleClick }>
				<FormCheckbox
					className="domain-item__checkbox"
					onChange={ this.onToggle }
					onClick={ this.stopPropagation }
				/>
				<div className="domain-item__link">
					<div className="domain-item__title">{ this.props.domain.domain }</div>
					<div className="domain-item__meta">Site: site name</div>
				</div>
			</CompactCard>
		);
	}
}

export default DomainItem;
