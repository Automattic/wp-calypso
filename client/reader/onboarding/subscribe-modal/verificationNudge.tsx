import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import EmailVerificationBanner from 'calypso/me/email-verification-banner';

const SubscribeVerificationNudge: React.FC = () => {
	const translate = useTranslate();

	const reloadLink = addQueryArgs( '/read', { reloadSubscriptionOnboarding: 'true' } );

	return (
		<EmailVerificationBanner
			dialogCloseLabel={ translate( 'I just verified my email' ) }
			dialogCloseAction={ () => window.location.replace( reloadLink ) }
			customDescription={ translate(
				'Verifying your email helps you secure your WordPress.com account and enables key features such as subscribing to sites. If necessary, please {{link}}click here{{/link}} to reload when complete.',
				{
					components: {
						link: (
							<a
								href={ reloadLink }
								onClick={ ( e ) => {
									e.preventDefault();
									window.location.replace( reloadLink );
								} }
							/>
						),
					},
				}
			) }
		/>
	);
};

export default SubscribeVerificationNudge;
