/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import useUpdateUserMutation from 'calypso/data/users/use-update-user-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useTranslate } from 'i18n-calypso';

const useSuccessNotice = ( isSuccess, user ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		isSuccess &&
			dispatch(
				successNotice(
					translate( 'Successfully updated @%(user)s', {
						args: { user: user?.login },
						context: 'Success message after a user has been modified.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
		// Note: We only want to run this effect in case `isSuccess`
		// changes and ignore changes to other deps like `user`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isSuccess ] );
};

const useErrorNotice = ( isError, user ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		isError &&
			dispatch(
				errorNotice(
					translate( 'There was an error updating @%(user)s', {
						args: { user: user?.login },
						context: 'Error message after A site has failed to perform actions on a user.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
		// Note: We only want to run this effect in case `isError`
		// changes and ignore changes to other deps like `user`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isError ] );
};

const withUpdateUser = ( Component ) => ( props ) => {
	const { siteId, user } = props;
	const { updateUser, isSuccess, isError, isLoading } = useUpdateUserMutation( siteId );

	useSuccessNotice( isSuccess, user );
	useErrorNotice( isError, user );

	return <Component { ...props } updateUser={ updateUser } isUpdating={ isLoading } />;
};

export default withUpdateUser;
