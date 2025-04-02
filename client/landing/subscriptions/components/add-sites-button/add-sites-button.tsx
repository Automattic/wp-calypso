import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AddSitesModal } from 'calypso/landing/subscriptions/components/add-sites-modal';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

import './styles.scss';

const AddSitesButton = () => {
	const translate = useTranslate();
	const [ isAddSitesModalVisible, setIsAddSitesModalVisible ] = useState( false );
	const dispatch = useDispatch();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	return (
		<>
			<Button
				variant="primary"
				className="button subscriptions-add-sites__button"
				onClick={ () => {
					if ( ! isEmailVerified ) {
						return dispatch(
							errorNotice( translate( 'Please verify your email before subscribing.' ), {
								id: 'resend-verification-email',
								button: translate( 'Account Settings' ),
								href: '/me/account',
							} )
						);
					}
					return setIsAddSitesModalVisible( true );
				} }
			>
				<Gridicon className="subscriptions-add-sites__button-icon" icon="plus" size={ 24 } />
				<span className="subscriptions-add-sites__button-text">
					{ translate( 'New subscription' ) }
				</span>
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
