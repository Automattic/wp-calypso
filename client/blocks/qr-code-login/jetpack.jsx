import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { TokenQRCode } from './index';

export const JetpackQRCodeLogin = ( { tokenState } ) => {
	const translate = useTranslate();

	const steps = [
		// translation: Link to the Jetpack App.
		translate( 'Open the {{link}}%(name)s App{{/link}} on your phone.', {
			args: {
				name: 'Jetpack',
			},
			components: {
				link: (
					<ExternalLink target="_blank" href="https://jetpack.com/app?campaign=login-qr-code" />
				),
			},
		} ),
		translate( 'Tap the Me tab.' ),
		translate( 'Tap the Scan Login Code option.' ),
		translate( 'Point your phone to the following QR code to scan it.' ),
	];

	const notice = translate(
		"Logging in via the Jetpack app is {{strong}}not available{{/strong}} if you've enabled two-step authentication on your WordPress.com account.",
		{
			components: {
				strong: <strong />,
			},
		}
	);

	return (
		<div className="qr-code-login-jetpack">
			<div className="qr-code-login-jetpack__instructions">
				<h1 className="qr-code-login-jetpack__heading">
					{ translate( 'Start with Jetpack app' ) }
				</h1>
				<ol className="qr-code-login-jetpack__steps">
					{ steps.map( ( step, index ) => (
						<li key={ 'step-' + index } className="qr-code-login-jetpack__step">
							{ step }
						</li>
					) ) }
				</ol>
			</div>

			<div className="qr-code-login-jetpack__token">
				<TokenQRCode tokenData={ tokenState } />
			</div>

			<p className="qr-code-login-jetpack__notice">{ notice }</p>
		</div>
	);
};
