import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';

const useAddSitesModalNotices = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const showErrorNotice = useCallback(
		( url: string ) => {
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
