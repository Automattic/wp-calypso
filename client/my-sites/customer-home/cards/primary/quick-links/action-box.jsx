/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';

const ActionBox = ( { external, href, onClick, target, iconSrc, label } ) => {
	const buttonAction = { href, onClick, target };
	return (
		<div className="quick-links__action-box">
			<Button { ...buttonAction }>
				<img src={ iconSrc } alt="" />
				<span>
					{ label } { external && <Gridicon icon="external" /> }
				</span>
			</Button>
		</div>
	);
};

export default ActionBox;
