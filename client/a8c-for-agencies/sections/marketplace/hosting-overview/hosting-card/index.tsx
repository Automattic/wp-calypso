import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getHostingLogo } from '../../lib/hosting';
import useHostingDescription from '../hooks/use-hosting-description';

import './style.scss';
type Props = {
	plan: APIProductFamilyProduct;
};

export default function HostingCard( { plan }: Props ) {
	const translate = useTranslate();

	const { name, description } = useHostingDescription( plan.family_slug );

	return (
		<div className="hosting-card">
			<div className="hosting-card__header">{ getHostingLogo( plan.family_slug ) }</div>

			<div className="hosting-card__price">
				<b className="hosting-card__price-value">
					{ translate( 'Starting at %(price)s', {
						args: { price: formatCurrency( Number( plan.amount ), plan.currency ) },
					} ) }
				</b>
				<div className="hosting-card__price-interval">
					{ plan.price_interval === 'day' && translate( 'USD per plan per day' ) }
					{ plan.price_interval === 'month' && translate( 'USD per plan per month' ) }
				</div>
			</div>

			<p className="hosting-card__description">{ description }</p>

			<Button className="hosting-card__explore-button" primary>
				{ translate( 'Explore %(hosting)s plans', {
					args: {
						hosting: name,
					},
				} ) }
			</Button>
		</div>
	);
}
