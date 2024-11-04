import { Card, DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const Card1 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Welcome to Automattic for Agencies' ) }</h1>
			<p>
				{ translate(
					"Automattic for Agencies is a new agency program that combines the best of Automattic's offerings all in one place. By partnering with us, you will have opportunities to grow your business with:"
				) }
			</p>

			<SimpleList
				items={ [
					translate( 'Significant discounts on our products and services' ),
					translate( 'Earn partner badges to align your agency with Automattic brands' ),
					translate( 'Recurring commissions on product referrals – including WooPayments' ),
					translate( 'Tooling to help you be more efficient' ),
				] }
			/>

			<br />

			<p>
				{ translate(
					'This is just the beginning. We look forward to partnering with you and seeing what the next chapter brings.'
				) }
			</p>
		</>
	);
};

const Card2 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Only pay for what you use' ) }</h1>
			<p>
				{ translate(
					"We aim to ensure your business grows with as little upfront cost as possible. That's why we've adopted a pay-for-what-you-use model across all our products, including hosting. This allows you to add and remove products as needed without paying for a whole year upfront to get the best prices."
				) }
			</p>
			<p>
				{ translate(
					'We will bill you at the start of each month for any hosting or products used in the previous month. These are charged on a per-day basis.'
				) }
			</p>
		</>
	);
};

const Card3 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Earn recurring commissions on referrals' ) }</h1>
			<p>
				{ translate(
					'With our novel create-a-cart feature, you can add any product in our marketplace to a cart for your client to purchase in just a few clicks. Once your client makes the purchase, you will receive a quarterly recurring commission (up to 50%).'
				) }
			</p>
			<p>
				{ translate(
					'You can also earn a five basis points commission on WooPayments TPV (Total Payments Volume) by referring new clients to WooPayments.'
				) }
			</p>
		</>
	);
};

const Card4 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Grow your business by getting listed on our partner directories' ) }</h1>
			<p>
				{ translate(
					'With our program, you can earn partner badges and align your agency with Woo, Jetpack, WordPress.com, and Pressable, enabling you to secure placement in multiple partner directory listings. All you need to do is demonstrate your expertise in supporting clients for each brand to get listed on their directory page.'
				) }
			</p>
		</>
	);
};

export default function OverviewBodyIntroCards( { onFinish = () => {} } ) {
	const dispatch = useDispatch();

	const tracksFn = ( tracksEventName?: string, tracksEventProps?: object ) => {
		if ( ! tracksEventName ) {
			return;
		}
		dispatch( recordTracksEvent( tracksEventName, tracksEventProps ) );
	};

	return (
		<Card className="a4a-intro-cards__wrapper">
			<div>
				<DotPager
					className="intro-cards"
					navArrowSize={ 24 }
					tracksPrefix="calypso_a4a_overview_intro_cards"
					tracksFn={ tracksFn }
					includeNextButton
					onFinish={ onFinish }
				>
					<Card1 />
					<Card2 />
					<Card3 />
					<Card4 />
				</DotPager>
			</div>
		</Card>
	);
}
