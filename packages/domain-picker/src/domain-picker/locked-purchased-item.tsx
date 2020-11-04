/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';

const LockedPurchasedItem: FunctionComponent< { domainName: string } > = ( { domainName } ) => {
	return (
		<div className="domain-picker__suggestion-item locked">
			<div className="domain-picker__suggestion-item-name">{ domainName }</div>
			<div className="domain-picker__price">
				<Icon icon={ check } size={ 18 } /> { __( 'Purchased', __i18n_text_domain__ ) }
			</div>
		</div>
	);
};

export default LockedPurchasedItem;
