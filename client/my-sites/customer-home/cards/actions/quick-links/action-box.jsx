/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import MaterialIcon from 'calypso/components/material-icon';
import Gridicon from 'calypso/components/gridicon';

const ActionBox = ( {
	href,
	onClick,
	target,
	iconSrc,
	label,
	materialIcon,
	gridicon,
	hideLinkIndicator,
} ) => {
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
		<CompactCard
			{ ...buttonAction }
			className={ classnames( 'quick-links__action-box', {
				'quick-links__action-box__hide-link-indicator': hideLinkIndicator,
			} ) }
		>
			<div className="quick-links__action-box-image">{ getIcon() }</div>
			<div className="quick-links__action-box-text">
				<h6 className="quick-links__action-box-label">{ label }</h6>
			</div>
		</CompactCard>
	);
};

export default ActionBox;
