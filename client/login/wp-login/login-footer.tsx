import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
}

const LoginFooter = ( { lostPasswordLink }: LoginFooterProps ) => {
	const translate = useTranslate();

	const tos = translate(
		// To make any changes to this copy please speak to the legal team
		'By continuing with any of the options above, ' +
			'you agree to our {{tosLink}}Terms of Service{{/tosLink}} and' +
			' have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
		{
			components: {
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				privacyLink: (
					<a
						href={ localizeUrl( 'https://automattic.com/privacy/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	return (
		<div className="wp-login__main-footer">
			{ lostPasswordLink }
			<p className="login__form-terms">{ tos }</p>
		</div>
	);
};

export default LoginFooter;
