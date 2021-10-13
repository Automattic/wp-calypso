import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import checkEmail from 'calypso/assets/images/illustrations/check-email.svg';
import HappinessSupport from 'calypso/components/happiness-support';

import './style.scss';

export default function DIFMLiteThankYou(): JSX.Element {
	const translate = useTranslate();

	return (
		<Card className="difm-lite-thank-you__content">
			<div className="difm-lite-thank-you__header">
				<div className="difm-lite-thank-you__header-icon">
					<img src={ '/calypso/images/upgrades/thank-you.svg' } alt="" />
				</div>
				<div className="difm-lite-thank-you__header-content">
					<h1 className="difm-lite-thank-you__header-heading">
						{ translate( 'Thank you for your purchase!' ) }
					</h1>

					<h2 className="difm-lite-thank-you__header-text">
						{ translate(
							'Our Built By WordPress.com team will be in touch with you when your site is ready to be transferred to your account and launched.'
						) }
					</h2>
				</div>
			</div>
			<Card className="difm-lite-thank-you__feature">
				<div>
					<div className="difm-lite-thank-you__image">
						<img alt="" src={ checkEmail } />
					</div>
					<div>
						<h3>{ translate( 'Questions?' ) }</h3>
						<p>
							{ translate( 'Email us at ' ) }
							<a href="mailto:builtby@wordpress.com">builtby@wordpress.com</a>
						</p>
						<div></div>
					</div>
				</div>
			</Card>
			<Card className="difm-lite-thank-you__feature">
				<HappinessSupport
					isJetpack={ false }
					liveChatButtonEventName="calypso_plans_autoconfig_chat_initiated"
					showLiveChatButton={ true }
				/>
			</Card>
		</Card>
	);
}
