/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import useUpdateUserMutation from 'calypso/data/users/use-update-user-mutation';
import { errorNotice, successNotice, plainNotice } from 'calypso/state/notices/actions';
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
	}, [ isSuccess, translate, dispatch, user ] );
};

const useErrorNotice = ( error, user ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		error &&
			dispatch(
				errorNotice(
					translate( 'There was an error updating @%(user)s', {
						args: { user: user?.login },
						context: 'Error message after A site has failed to perform actions on a user.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
	}, [ error, translate, dispatch, user ] );
};

const usePendingNotice = ( isPending, user ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		isPending &&
			dispatch(
				plainNotice(
					translate( 'Updating @%(user)s', {
						args: { user: user?.login },
						context: 'In progress message while a site is performing actions on users.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
	}, [ isPending, translate, dispatch, user ] );
};

const withUpdateUser = ( Component ) => ( props ) => {
	const { siteId, user } = props;
	const { updateUser, isSuccess, error, isLoading } = useUpdateUserMutation( siteId );

	useSuccessNotice( isSuccess, user );
	useErrorNotice( error, user );
	usePendingNotice( isLoading, user );

	return <Component { ...props } updateUser={ updateUser } isUpdating={ isLoading } />;
};

export default withUpdateUser;
