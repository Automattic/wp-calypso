import { isEnabled } from '@automattic/calypso-config';
import { Button, JetpackLogo } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { MarketplaceTypeContext } from '../../context';
import useWPCOMPlanDescription from './hooks/use-wpcom-plan-description';

import './style.scss';

type Props = {
	plan: APIProductFamilyProduct;
	quantity: number;
	discount: number;
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	isLoading?: boolean;
};

export default function WPCOMPlanCard( { plan, quantity, discount, onSelect, isLoading }: Props ) {
	const translate = useTranslate();

	const originalPrice = Number( plan.amount ) * quantity;
	const actualPrice = originalPrice - originalPrice * discount;

	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const referralMode = marketplaceType === 'referral';

	const { name, features1, features2, jetpackFeatures1, jetpackFeatures2 } =
		useWPCOMPlanDescription( plan.slug );

	let buttonText =
		quantity > 1
			? translate( 'Add %(quantity)s %(planName)s sites to cart', {
					args: {
						quantity,
						planName: name,
					},
					comment:
						'%(quantity)s is the quantity of plans and %(planName)s is the name of the plan.',
			  } )
			: translate( 'Add %(planName)s to cart', {
					args: {
						planName: name,
					},
					comment: '%(planName)s is the name of the plan.',
			  } );

	if ( isAutomatedReferrals && referralMode ) {
		buttonText = translate( 'Add to referral' );
	}

	return (
		<div className="wpcom-plan-card">
			<div className="wpcom-plan-card__section is-main">
				<div className="wpcom-plan-card__header">
					<h2 className="wpcom-plan-card__title">{ name }</h2>

					{ isLoading && <div className="wpcom-plan-card__price is-placeholder"></div> }

					{ ! isLoading && (
						<div className="wpcom-plan-card__price">
							<b className="wpcom-plan-card__price-actual-value">
								{ formatCurrency( actualPrice, plan.currency ) }
							</b>
							{ !! discount && (
								<>
									<b className="wpcom-plan-card__price-original-value">
										{ formatCurrency( originalPrice, plan.currency ) }
									</b>

									<span className="wpcom-plan-card__price-discount">
										{ translate( 'You save %(discount)s%', {
											args: {
												discount: Math.floor( discount * 100 ),
											},
											comment: '%(discount)s is the discount percentage.',
										} ) }
									</span>
								</>
							) }
							<div className="wpcom-plan-card__price-interval">
								{ plan.price_interval === 'day' && translate( 'per day' ) }
								{ plan.price_interval === 'month' && translate( 'per month' ) }
							</div>
						</div>
					) }
				</div>

				{ isLoading && <div className="wpcom-plan-card__cta is-placeholder"></div> }

				{ ! isLoading && (
					<Button primary onClick={ () => onSelect( plan, quantity ) }>
						{ buttonText }
					</Button>
				) }

				<div className="wpcom-plan-card__features">
					{ !! features1.length && <SimpleList items={ features1 } /> }
					{ !! features2.length && <SimpleList items={ features2 } /> }
				</div>
			</div>
			<div className="wpcom-plan-card__section">
				<h2 className="wpcom-plan-card__title">
					<JetpackLogo size={ 20 } />{ ' ' }
					{ translate( 'Premium Jetpack features included with WordPress.com plans' ) }{ ' ' }
				</h2>

				<div className="wpcom-plan-card__features is-jetpack">
					{ !! jetpackFeatures1.length && <SimpleList items={ jetpackFeatures1 } /> }
					{ !! jetpackFeatures2.length && <SimpleList items={ jetpackFeatures2 } /> }
				</div>
			</div>
		</div>
	);
}
