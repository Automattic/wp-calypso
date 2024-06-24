import { DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const Card1 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( '👋 Welcome to Jetpack Manage' ) }</h1>
			<p>
				{ translate(
					'Jetpack Manage helps you to monitor security and performance across all of your sites in a single place.'
				) }
			</p>
			<ul>
				<li>{ translate( 'Insights: traffic and real-time uptime stats.' ) }</li>
				<li>{ translate( 'Plugin Updates: bulk update plugins in one click.' ) }</li>
				<li>{ translate( 'Backups & Scans: safeguard your sites and data.' ) }</li>
				<li>{ translate( 'Boost: manage performance across all of your sites.' ) }</li>
			</ul>
		</>
	);
};

const Card2 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Get notified immediately when a site needs attention' ) }</h1>
			<p>
				{ translate(
					"When we detect an issue with one of your sites, you'll get notified immediately. The dashboard will also flag the issue for that site using a traffic light warning system — red for severe or yellow for a warning."
				) }
			</p>
			<p>
				{ translate(
					'You can filter the site list in the dashboard by issue type to zero in on the sites that need your attention.'
				) }
			</p>
		</>
	);
};

const Card3 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Flexible billing and a recurring discount' ) }</h1>
			<p>
				{ translate(
					"With Jetpack Manage, you don't need to commit to a year upfront, and you only pay for the number of days that each license you purchase is active, giving you more flexibility and reducing costs. You get a recurring discount, not just for one year."
				) }
			</p>
		</>
	);
};

const Card4 = () => {
	const translate = useTranslate();
	return (
		<>
			<h1>{ translate( 'Use Jetpack Manage from anywhere' ) }</h1>
			<p>
				{ translate(
					'Jetpack Manage is mobile optimized, meaning you can use it on any device that you own, on the go, on your couch, or at your desk — you decide.'
				) }
			</p>
		</>
	);
};

export default function IntroCards( { onFinish = () => {} } ) {
	const dispatch = useDispatch();

	const tracksFn = ( tracksEventName?: string, tracksEventProps?: object ) => {
		if ( ! tracksEventName ) {
			return;
		}
		dispatch( recordTracksEvent( tracksEventName, tracksEventProps ) );
	};

	return (
		<DotPager
			className="intro-cards"
			navArrowSize={ 24 }
			tracksPrefix="calypso_jetpack_manage_overview_intro_cards"
			tracksFn={ tracksFn }
			includeNextButton
			includeFinishButton
			onFinish={ onFinish }
		>
			<Card1 />
			<Card2 />
			<Card3 />
			<Card4 />
		</DotPager>
	);
}
