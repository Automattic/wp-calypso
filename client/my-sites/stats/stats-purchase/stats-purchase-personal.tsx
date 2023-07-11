/* eslint-disable jsx-a11y/anchor-is-valid */
import { PricingSlider, RenderThumbFunction } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => number;
	handlePlanSwap: ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => void;
}

const AVERAGE_PRICE_INFO = '$6';

const PersonalPurchase = ( {
	subscriptionValue,
	setSubscriptionValue,
	handlePlanSwap,
}: PersonalPurchaseProps ) => {
	const translate = useTranslate();

	const sliderLabel = ( ( props, state ) => {
		let emoji;

		if ( subscriptionValue < 10 ) {
			emoji = String.fromCodePoint( 0x1f60a ); /* Smiling face emoji */
		} else if ( subscriptionValue < 40 ) {
			emoji = String.fromCodePoint( 0x2764, 0xfe0f ); /* Heart emoji */
		} else if ( subscriptionValue >= 40 ) {
			emoji = String.fromCodePoint( 0x1f525 ); /* Fire emoji */
		}

		return (
			<div { ...props }>
				${ state?.valueNow || subscriptionValue }/{ translate( 'month' ) }{ ' ' }
				{ subscriptionValue > 0 && emoji }
			</div>
		);
	} ) as RenderThumbFunction;
	const handleClick = ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) =>
		handlePlanSwap( e );

	return (
		<div>
			{ subscriptionValue < 10 && (
				<div className={ `${ COMPONENT_CLASS_NAME }__notice` }>
					{ translate(
						'This plan is for personal sites only. If your site is used for a commercial activity, {{Button}}you will need to choose a commercial paln{{/Button}}.',
						{
							components: {
								Button: <Button variant="link" href="#" onClick={ handleClick } />,
							},
						}
					) }
				</div>
			) }
			<PricingSlider
				className={ `${ COMPONENT_CLASS_NAME }__slider` }
				value={ subscriptionValue }
				renderThumb={ sliderLabel }
				onChange={ setSubscriptionValue }
				maxValue={ 50 }
			/>

			<p className={ `${ COMPONENT_CLASS_NAME }__average-price` }>
				{ translate( 'The average person pays %(value)s per month', {
					args: {
						value: AVERAGE_PRICE_INFO,
					},
				} ) }
			</p>

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				{ subscriptionValue === 0 ? (
					<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
						<li>{ translate( 'No access to upcoming features' ) }</li>
						<li>{ translate( 'No priority support' ) }</li>
						<li>{ translate( "You'll see upsells and ads in the Stats page" ) }</li>
					</ul>
				) : (
					<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
						<li>{ translate( 'Instant access to upcoming features' ) }</li>
						<li>{ translate( 'Priority support' ) }</li>
						<li>{ translate( 'Ad-free experience' ) }</li>
					</ul>
				) }
			</div>

			<p>
				{ translate(
					`By clicking the button below, you agree to our {{a}}Terms of Service{{/a}} and to {{b}}share details{{/b}} with WordPress.com.`,
					{
						components: {
							a: <Button variant="link" href="#" />,
							b: <Button variant="link" href="#" />,
						},
					}
				) }
			</p>

			{ subscriptionValue === 0 ? (
				<Button variant="primary">{ translate( 'Continue with Jetpack Stats for free' ) }</Button>
			) : (
				<Button variant="primary">
					{ translate( 'Get Jetpack Stats for %(value)s per month', {
						args: {
							value: subscriptionValue,
						},
					} ) }
				</Button>
			) }
		</div>
	);
};

export default PersonalPurchase;
