/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import type { DetailsCardProps } from './types';

import './style.scss';

const ConnectedDomainDetails = ( {
	domain,
	isLoadingPurchase,
	selectedSite,
}: DetailsCardProps ): JSX.Element => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const renderPlanDetailsButton = () => {
		return (
			<Button
				href={ getManagePurchaseUrlFor( selectedSite.slug, domain.bundledPlanSubscriptionId ) }
				disabled={ isLoadingPurchase }
			>
				{ translate( 'View plan settings' ) }
			</Button>
		);
	};

	const args = {
		args: {
			expirationDate: moment( domain.expiry ).format( 'LL' ),
		},
	};

	const text = domain.bundledPlanSubscriptionId
		? translate( 'Domain connection expires with your plan on %(expirationDate)s', args )
		: translate( 'Domain connection expires on %(expirationDate)s', args );

	return (
		<div className="details-card">
			<div className="details-card__section">{ text }</div>
			<div className="details-card__section">{ renderPlanDetailsButton() }</div>
		</div>
	);
};

export default ConnectedDomainDetails;
