import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import { getTitanProductName } from 'calypso/lib/titan';
import { ProviderCard } from 'calypso/my-sites/email/email-providers-stacked-comparison';

import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const logo = <Gridicon className="professional-email-card__logo" icon="my-sites" />;
const badge = <img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />;
const getTitanFeatures = () => {
	return [
		translate( 'Inbox, calendars, and contacts' ),
		translate( '30GB storage' ),
		translate( '24/7 support via email' ),
	];
};

export const professionalEmailCard: ProviderCard = {
	detailsExpanded: true,
	expandButtonLabel: translate( 'Expand' ),
	formFields: <form> Placeholder </form>,
	formattedPrice: '3.5$',
	onExpandedChange: noop,
	providerKey: '',
	showExpandButton: false,
	description: translate( 'Integrated email solution for your WordPress.com site.' ),
	logo,
	productName: getTitanProductName(),
	badge,
	features: getTitanFeatures(),
};
