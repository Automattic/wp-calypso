import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailFallbackNoticeProps {
	isChatRestricted?: boolean;
}

export const EmailFallbackNotice = ( { isChatRestricted }: EmailFallbackNoticeProps ) => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	params.set( 'wapuuFlow', 'true' );
	const url = '/contact-form?' + params.toString();

	const title = isChatRestricted
		? __( 'Live chat is currently unavailable.', __i18n_text_domain__ )
		: __( 'Live chat is temporarily unavailable for scheduled maintenance.', __i18n_text_domain__ );

	const message = __(
		'Please reach out via <email>email</email> if you need assistance.',
		__i18n_text_domain__
	);

	return (
		<div className="help-center__notice email-fallback-notice">
			<Icon icon={ info } className="help-center__notice-icon" />
			<p>
				<strong>{ title }</strong>
				&nbsp;
				{ createInterpolateElement( message, {
					email: (
						<Button
							variant="link"
							className="help-center__notice-link"
							onClick={ () => navigate( url ) }
						/>
					),
				} ) }
			</p>
		</div>
	);
};
