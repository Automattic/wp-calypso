import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { SuccessIcon } from './success-icon';

import './ticket-success-screen.scss';

export const SuccessScreen: React.FC = () => {
	const { __ } = useI18n();

	return (
		<div>
			<div className="ticket-success-screen__help-center">
				<SuccessIcon />
				<h1 className="ticket-success-screen__help-center-heading">
					{ __( "We're on it!", __i18n_text_domain__ ) }
				</h1>
				<p className="ticket-success-screen__help-center-message">
					{ __(
						"We've received your message, and you'll hear back from one of our Happiness Engineers shortly.",
						__i18n_text_domain__
					) }
				</p>
			</div>
		</div>
	);
};
