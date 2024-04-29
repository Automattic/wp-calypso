import { isEnabled } from '@automattic/calypso-config';
import { Badge, Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import SimpleList from '../../common/simple-list';
import { getHostingLogo, getHostingPageUrl } from '../../lib/hosting';
import useHostingDescription from '../hooks/use-hosting-description';

import './style.scss';

type Props = {
	plan: APIProductFamilyProduct;
	pressableOwnership?: boolean;
};

export default function HostingCard( { plan, pressableOwnership }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	//FIXME: We want to unify and refactor this logic, once we decide
	//on how the UX should look in the end
	const pressableUrl = 'https://my.pressable.com/agency/auth';

	const { name, description, features } = useHostingDescription( plan.family_slug );

	const onExploreClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_marketplace_hosting_overview_explore_plan_click', {
				hosting: plan.family_slug,
			} )
		);
	};

	return (
		<div className="hosting-card">
			<div className="hosting-card__section">
				<div className="hosting-card__header">
					{ getHostingLogo( plan.family_slug ) }
					{ pressableOwnership && <Badge type="success">{ translate( 'You own this' ) }</Badge> }
				</div>

				<p className="hosting-card__description">{ description }</p>

				<div className="hosting-card__price">
					<b className="hosting-card__price-value">
						{ translate( 'Starting at %(price)s', {
							args: { price: formatCurrency( Number( plan.amount ), plan.currency ) },
						} ) }
					</b>
					<div className="hosting-card__price-interval">
						{ plan.price_interval === 'day' &&
							translate( 'USD per plan per day, billed annually' ) }
						{ plan.price_interval === 'month' &&
							translate( 'USD per plan per month, billed annually' ) }
					</div>
				</div>

				{ ! pressableOwnership ? (
					<Button
						className="hosting-card__explore-button"
						href={ getHostingPageUrl( plan.family_slug ) }
						onClick={ onExploreClick }
						primary
					>
						{ translate( 'Explore %(hosting)s plans', {
							args: {
								hosting: name,
							},
							comment: '%(hosting)s is the name of the hosting provider.',
						} ) }
					</Button>
				) : (
					<Button
						className="hosting-card__pressable-dashboard-button"
						target="_blank"
						rel="norefferer nooppener"
						href={ pressableUrl }
					>
						{ translate( 'Go to Pressable Dashboard' ) }
						<Icon icon={ external } size={ 18 } />
					</Button>
				) }
			</div>

			{ isEnabled( 'a8c-for-agencies/wpcom-creator-plan-purchase-flow' ) && (
				<div className="hosting-card__section">
					<SimpleList items={ features } />
				</div>
			) }
		</div>
	);
}
