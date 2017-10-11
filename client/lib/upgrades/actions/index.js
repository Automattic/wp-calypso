/**
 * Internal dependencies
 *
 * @format
 */

import * as cart from './cart';
import * as checkout from './checkout';
import * as freeTrials from './free-trials';
import * as domainManagement from './domain-management';
import * as domainSearch from './domain-search';
import * as purchases from './purchases';

const exported = {
 ...cart,
 ...checkout,
 ...freeTrials,
 ...domainManagement,
 ...domainSearch,
 ...purchases
};

export default exported;
