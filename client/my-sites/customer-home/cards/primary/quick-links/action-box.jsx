/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import MaterialIcon from 'components/material-icon';
import Gridicon from 'components/gridicon';

const ActionBox = ( { href, onClick, target, iconSrc, label, materialIcon, gridicon } ) => {
	const buttonAction = { href, onClick, target };
	const getIcon = () => {
		if ( materialIcon ) {
			return <MaterialIcon className="quick-links__action-box-icon" icon={ materialIcon } />;
		}

		if ( gridicon ) {
			return <Gridicon className="quick-links__action-box-icon" icon={ gridicon } />;
		}

		return <img className="quick-links__action-box-icon" src={ iconSrc } alt="" />;
	};

	return (
		<CompactCard { ...buttonAction } displayAsLink className="quick-links__action-box">
			<div className="quick-links__action-box-image">{ getIcon() }</div>
			<div className="quick-links__action-box-text">
				<h6 className="quick-links__action-box-label">{ label }</h6>
			</div>
		</CompactCard>
	);
};

export default ActionBox;
