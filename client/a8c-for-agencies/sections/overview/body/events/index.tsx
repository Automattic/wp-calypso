import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import klaviyoEventImage from 'calypso/assets/images/a8c-for-agencies/events/klaviyo-compliment-image.svg';
import klaviyoLogo from 'calypso/assets/images/a8c-for-agencies/events/klaviyo-logo.svg';
import wooEventImage from 'calypso/assets/images/a8c-for-agencies/events/woo-compliment-image.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './styles.scss';

const OverviewBodyEvents = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const klaviyoRegistrationUrl =
		'https://us02web.zoom.us/webinar/register/4117473222555/WN_tp0MS84_TYyp4NP9XMmRfQ#/registration';

	const wooRegistrationUrl =
		'https://developer.woocommerce.com/youre-invited-to-step-inside-woo-marketing/';

	const handleKlaviyoRegisterClick = (): void => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_events_klaviyo_register_click', {
				href: klaviyoRegistrationUrl,
			} )
		);
	};

	const handleWooRegisterClick = (): void => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_events_woo_register_click', {
				href: wooRegistrationUrl,
			} )
		);
	};

	return (
		<Offering
			title={ translate( 'Upcoming events' ) }
			description={ translate(
				'Grow your business and level up by joining exclusive Automattic for Agencies events.'
			) }
		>
			<div className="a4a-events">
				<div className="a4a-event">
					<div className="a4a-event__content">
						<div className="a4a-event__header">
							<div className="a4a-event__logo">
								<img src={ klaviyoLogo } alt="Klaviyo" />
							</div>
							<div className="a4a-event__date-and-title">
								<div className="a4a-event__date a4a-event__date--klaviyo">
									{ translate( 'June 12th' ) }
								</div>
								<h3 className="a4a-event__title">
									{ translate( 'Grow your agency with Klaviyo and WooCommerce' ) }
								</h3>
								<p className="a4a-event__meta">
									{ translate( 'Automattic for Agencies / Klaviyo webinar' ) }
								</p>
							</div>
						</div>

						<p className="a4a-event__description">
							{ translate(
								"Learn how to leverage Klaviyo's marketing tools with WooCommerce to grow your clients' stores. Guided by industry experts, explore seamless integration and effective strategies designed to enhance your agency's ability to drive client success."
							) }
						</p>

						<Button
							className="a4a-event__button"
							variant="secondary"
							target="_blank"
							href={ klaviyoRegistrationUrl }
							onClick={ handleKlaviyoRegisterClick }
						>
							{ translate( 'Register now ↗' ) }
						</Button>
					</div>
					<div
						className="a4a-event__image a4a-event__image--klaviyo"
						style={ { backgroundImage: `url(${ klaviyoEventImage })` } }
					></div>
				</div>

				<div className="a4a-event">
					<div className="a4a-event__content">
						<div className="a4a-event__header">
							<div className="a4a-event__logo">
								<img src={ wooLogo } alt="WooCommerce" />
							</div>
							<div className="a4a-event__date-and-title">
								<div className="a4a-event__date a4a-event__date--woo">
									{ translate( 'June 25th' ) }
								</div>
								<h3 className="a4a-event__title">
									{ translate( "You're invited to Step Inside: Woo Marketing" ) }
								</h3>
								<p className="a4a-event__meta">
									{ translate( 'Woo Marketing + Automattic for Agencies event' ) }
								</p>
							</div>
						</div>

						<p className="a4a-event__description">
							{ translate(
								'Woo is extending an invitation to Automattic for Agencies partners to join a live conversation with CMO Tamara Niesen and VP Customer Marketing Mahrie Boyle about WooCommerce’s future marketing direction. Learn about the recent brand refresh, upcoming 2025 advertising campaigns, demand generation, and how Woo plans to collaborate closely with the community to grow the ecosystem.'
							) }
						</p>

						<Button
							className="a4a-event__button"
							variant="secondary"
							target="_blank"
							href={ wooRegistrationUrl }
							onClick={ handleWooRegisterClick }
						>
							{ translate( 'Register now ↗' ) }
						</Button>
					</div>
					<div
						className="a4a-event__image a4a-event__image--woo"
						style={ { backgroundImage: `url(${ wooEventImage })` } }
					></div>
				</div>
			</div>
		</Offering>
	);
};

export default OverviewBodyEvents;
