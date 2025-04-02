import { useTranslate } from 'i18n-calypso';
import './style.scss';

function P2SignupProcessingScreen( { signupSiteName = '' } ) {
	const translate = useTranslate();

	return (
		<div className="p2-processing-screen">
			<div className="p2-processing-screen__logo">
				<img src="/calypso/images/p2/logo-white.png" width="67" height="32" alt="P2 logo" />
			</div>

			<div className="p2-processing-screen__container">
				<div className="p2-processing-screen__spinner"></div>

				<div className="p2-processing-screen__text">
					{ translate( '{{h2}}Hooray!{{/h2}}', {
						components: {
							// eslint-disable-next-line jsx-a11y/heading-has-content
							h2: <h2 />,
						},
					} ) }
				</div>
				<div className="p2-processing-screen__text">
					{ translate( '{{p}}Your workspace "%(signupSiteName)s" is almost ready.{{/p}}', {
						components: {
							// eslint-disable-next-line jsx-a11y/heading-has-content
							p: <p />,
						},
						args: {
							signupSiteName,
						},
					} ) }
				</div>
			</div>

			<div className="p2-processing-screen__footer">
				<img
					src="/calypso/images/p2/w-logo-white.png"
					className="p2-processing-screen__w-logo"
					alt="WP.com logo"
				/>
				<span className="p2-processing-screen__footer-text">
					{ translate( 'Powered by WordPress.com' ) }
				</span>
			</div>
		</div>
	);
}

export default P2SignupProcessingScreen;
