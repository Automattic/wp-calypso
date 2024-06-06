import { __ } from '@wordpress/i18n';
import { Mode } from '../types';

export const useContactFormTitle = (
	mode: Mode
): {
	formTitle: string;
	trayText?: string;
	formDisclaimer?: string | React.ReactElement | undefined;
	buttonLabel: string;
	buttonSubmittingLabel: string;
	buttonLoadingLabel?: string;
} => {
	return {
		CHAT: {
			formTitle: __( 'Contact WordPress.com Support', __i18n_text_domain__ ),
			trayText: __( 'Our WordPress experts will be with you right away', __i18n_text_domain__ ),
			buttonLabel: __( 'Contact us', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Connecting to chat', __i18n_text_domain__ ),
		},
		EMAIL: {
			formTitle: __( '', __i18n_text_domain__ ),
			trayText: __( 'Our WordPress experts will get back to you soon', __i18n_text_domain__ ),
			buttonLabel: __( 'Email us', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Sending email', __i18n_text_domain__ ),
		},
		FORUM: {
			formTitle: __( 'Ask in our community forums', __i18n_text_domain__ ),
			formDisclaimer: (
				<>
					{ __( 'Your question and any answers will be public.', __i18n_text_domain__ ) }
					<br />
					{ __( 'Please do not share financial or contact information.', __i18n_text_domain__ ) }
				</>
			),
			buttonLabel: __( 'Ask in the forums', __i18n_text_domain__ ),
			buttonSubmittingLabel: __( 'Posting in the forums', __i18n_text_domain__ ),
			buttonLoadingLabel: __( 'Analyzing site…', __i18n_text_domain__ ),
		},
	}[ mode ];
};
