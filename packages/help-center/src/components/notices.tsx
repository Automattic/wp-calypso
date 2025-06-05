import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import './notices.scss';

export const NewThirdPartyCookiesNotice: React.FC = () => {
	return (
		<div className="help-center__notice cookie-warning">
			<p>
				<strong>{ __( 'Enable cookies to get support.', __i18n_text_domain__ ) }</strong>
				&nbsp;
				{ __(
					'To access support, please turn on third-party cookies for WordPress.com.',
					__i18n_text_domain__
				) }
				&nbsp;
				<a
					target="_blank"
					rel="noopener noreferrer"
					href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) }
				>
					{ __( 'Learn more.', __i18n_text_domain__ ) }
				</a>
			</p>
		</div>
	);
};

export const EmailFallbackNotice: React.FC = () => {
	return (
		<div className="help-center__notice">
			<p>
				<strong>
					{ __(
						'Live chat is temporarily unavailable for scheduled maintenance.',
						__i18n_text_domain__
					) }
				</strong>
				&nbsp;
				{ __(
					'We`re sorry for the inconvenience and appreciate your patience. Please feel free to reach out via email or check our Support Guides in the meantime.',
					__i18n_text_domain__
				) }
			</p>
		</div>
	);
};
