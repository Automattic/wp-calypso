import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';

const useAddSitesModalNotices = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const showErrorNotice = useCallback(
		( url: string, error?: { error?: string } ) => {
			if ( error?.error === 'email_unverified' ) {
				dispatch(
					errorNotice(
						translate( 'Please verify your email before subscribing.', {
							comment: 'Error shown when trying to subscribe to a site with an unverified email.',
						} ),
						{
							id: 'resend-verification-email',
							button: translate( 'Account Settings' ),
							onClick: () => {
								page( '/me/account' );
							},
						}
					)
				);
				return;
			}

			dispatch(
				errorNotice(
					translate( 'There was an error when trying to subscribe to %s.', {
						args: [ url ],
						comment: 'URL of the site that the user tried to subscribe to.',
					} )
				)
			);
		},
		[ dispatch, translate ]
	);

	const showSuccessNotice = useCallback(
		( url: string ) => {
			dispatch(
				successNotice(
					translate( 'You have successfully subscribed to %s.', {
						args: [ url ],
						comment: 'URL of the site that the user successfully subscribed to.',
					} )
				)
			);
		},
		[ dispatch, translate ]
	);

	const showWarningNotice = useCallback(
		( url: string ) => {
			dispatch(
				warningNotice(
					translate( 'You are already subscribed to %s.', {
						args: [ url ],
						comment: 'URL of the site that the user is already subscribed to.',
					} )
				)
			);
		},
		[ dispatch, translate ]
	);

	return {
		showErrorNotice,
		showSuccessNotice,
		showWarningNotice,
	};
};

export default useAddSitesModalNotices;
