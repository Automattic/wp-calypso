import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

const GravPoweredLoginPageFooter = () => {
	const translate = useTranslate();

	return (
		<div className="grav-powered-login__page-footer">
			<div className="grav-powered-login__page-footer-links">
				<a
					href={ localizeUrl( 'https://wordpress.com/about/' ) }
					rel="noopener noreferrer"
					target="_blank"
					title={ translate( 'About' ) }
				>
					{ translate( 'About' ) }
				</a>
				<a
					href={ localizeUrl( 'https://automattic.com/privacy/' ) }
					rel="noopener noreferrer"
					target="_blank"
					title={ translate( 'Privacy' ) }
				>
					{ translate( 'Privacy' ) }
				</a>
				<a
					href={ localizeUrl( 'https://wordpress.com/tos/' ) }
					rel="noopener noreferrer"
					target="_blank"
					title={ translate( 'Terms of Service' ) }
				>
					{ translate( 'Terms of Service' ) }
				</a>
			</div>
		</div>
	);
};

export default GravPoweredLoginPageFooter;
