import { Gridicon, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { OrderInfo } from 'calypso/data/promote-post/use-promote-post-billing-summary-query';
import { formatNumber } from 'calypso/my-sites/promote-post-i2/utils';

import './style.scss';

interface Props {
	payment_links: OrderInfo[];
}

export default function PaymentLinks( props: Props ) {
	const translate = useTranslate();
	const { payment_links } = props;
	return (
		<div className="promoted-posts__payment-links-container">
			<div className="promoted-posts__payment-links">
				<div className="promoted-posts__payment-link-row">
					<div className="payment-link__label">{ translate( 'Date' ) }</div>
					<div className="payment-link__label">{ translate( 'Amount' ) }</div>
					<div>&nbsp;</div>
				</div>
				{ payment_links.map( ( info, index ) => (
					<div key={ index } className="promoted-posts__payment-link-row">
						<div>{ moment( info.date ).format( 'MMMM DD, YYYY' ) }</div>
						<div>${ formatNumber( info.amount ) }</div>
						<div className="payment-link__link">
							<ExternalLink href={ info.url } target="_blank">
								{ translate( 'Pay' ) }
								<Gridicon icon="external" size={ 16 } />
							</ExternalLink>
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
}
