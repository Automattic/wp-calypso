/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

const ActionBox = ( { href, onClick, target, iconSrc, label, subtitle } ) => {
	const buttonAction = { href, onClick, target };
	return (
		<CompactCard { ...buttonAction } displayAsLink className="quick-links__action-box">
			<div className="quick-links__action-box-image">
				<img src={ iconSrc } alt="" />
			</div>
			<div className="quick-links__action-box-text">
				<h6 className="quick-links__action-box-label">{ label }</h6>
				<span className="quick-links__action-box-subtitle">{ subtitle }</span>
			</div>
		</CompactCard>
	);
};

export default ActionBox;
