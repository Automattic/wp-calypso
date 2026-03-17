import { Button } from '@wordpress/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

import './styles.scss';

const AddSitesButton = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const handleClick = (
		event: React.MouseEvent< HTMLButtonElement > | React.MouseEvent< HTMLAnchorElement >
	) => {
		recordTracksEvent( 'calypso_subscriptions_add_sites_button_click' );
		if ( ! isEmailVerified ) {
			event.preventDefault();
			return dispatch(
				errorNotice( translate( 'Please verify your email before subscribing.' ), {
					id: 'resend-verification-email',
					button: translate( 'Account Settings' ),
					href: '/me/account',
				} )
			);
		}
	};

	return (
		<>
			<Button
				variant="primary"
				className="button subscriptions-add-sites__button"
				onClick={ handleClick }
				href={ isEmailVerified ? '/reader/new' : undefined }
			>
				<Icon className="subscriptions-add-sites__button-icon" icon={ plus } />
				<span className="subscriptions-add-sites__button-text">
					{ translate( 'New subscription' ) }
				</span>
			</Button>
		</>
	);
};

export default AddSitesButton;
