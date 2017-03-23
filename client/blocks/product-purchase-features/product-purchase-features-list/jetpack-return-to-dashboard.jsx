/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize(({ selectedSite, translate }) => {
    const adminURL = get(selectedSite, 'options.admin_url', '');

    return (
        <div className="product-purchase-features-list__item">
            <PurchaseDetail
                icon="house"
                title={translate("Return to your site's dashboard")}
                buttonText={translate('Go back to %(site)s', { args: { site: selectedSite.name } })}
                href={adminURL}
            />
        </div>
    );
});
