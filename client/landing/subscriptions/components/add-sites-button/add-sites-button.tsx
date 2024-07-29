import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useResendEmailVerification } from 'calypso/landing/stepper/hooks/use-resend-email-verification';
import { AddSitesModal } from 'calypso/landing/subscriptions/components/add-sites-modal';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

import './styles.scss';

const AddSitesButton = () => {
	const translate = useTranslate();
	const [ isAddSitesModalVisible, setIsAddSitesModalVisible ] = useState( false );
	const dispatch = useDispatch();
	const resendEmailVerification = useResendEmailVerification();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	return (
		<>
			<Button
				primary
				className="subscriptions-add-sites__button"
				onClick={ () => {
					if ( ! isEmailVerified ) {
						return dispatch(
							errorNotice( translate( 'Your email has not been verified yet.' ), {
								id: 'resend-verification-email',
								button: translate( 'Resend Email' ),
								onClick: () => {
									resendEmailVerification();
								},
							} )
						);
					}
					return setIsAddSitesModalVisible( true );
				} }
			>
				<Gridicon className="subscriptions-add-sites__button-icon" icon="plus" size={ 24 } />
				<span className="subscriptions-add-sites__button-text">{ translate( 'Add a site' ) }</span>
			</Button>
			<AddSitesModal
				showModal={ isAddSitesModalVisible }
				onClose={ () => setIsAddSitesModalVisible( false ) }
				onAddFinished={ () => setIsAddSitesModalVisible( false ) }
			/>
		</>
	);
};

export default AddSitesButton;
