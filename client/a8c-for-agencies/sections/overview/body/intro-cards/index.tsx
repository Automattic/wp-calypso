import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DotPager from 'calypso/components/dot-pager';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const Card1 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Welcome to the Automattic for Agencies beta' ) }</h1>
			<p>
				{ translate(
					'Automattic for Agencies is a new agency program that brings together all of Automattic’s brands under one roof, enabling you to get the best deals on our products and services. We’ll also provide you with tooling to help you be more efficient in your work and grow your business.'
				) }
			</p>
			<p>
				{ translate(
					'This is only just the beginning. Soon, we’ll add referral commissions, partner directory listings across our brands, bonus incentives, and much more.'
				) }
			</p>
		</>
	);
};

const Card2 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Get big discounts when purchasing in bulk' ) }</h1>
			<p>
				{ translate(
					'You can save up to 80% on Woo, Jetpack, WordPress.com, and Pressable plans when purchasing in bulk. We also charge on a monthly basis, so you don’t have to pay for a year upfront to get the best prices.'
				) }
			</p>
		</>
	);
};

const Card3 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Manage all of your sites in a single place, regardless of host' ) }</h1>
			<p>
				{ translate(
					'With our sites dashboard, you can get a birds-eye view of the security and performance across all your sites, regardless of host. You’ll be notified immediately if critical issues need your attention, ensuring your clients remain happy.'
				) }
			</p>
		</>
	);
};

const Card4 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'And more to come' ) }</h1>
			<p>
				{ translate(
					// to do: change the x@automattic.com email address
					'We’re only just getting started. Our mission is to create an agency program that helps your business to grow with us. If you have any feedback or suggestions for us, we’d love to hear from you at X@automattic.com.'
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
		<Card>
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
