import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import useUpdateUserMutation from 'calypso/data/users/use-update-user-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const withUpdateUser = ( Component ) => ( props ) => {
	const { siteId, user } = props;
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { updateUser, isLoading } = useUpdateUserMutation( siteId, {
		onSuccess() {
			dispatch(
				successNotice(
					translate( 'Successfully updated @%(user)s', {
						args: { user: user.login },
						context: 'Success message after a user has been modified.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
		},
		onError() {
			dispatch(
				errorNotice(
					translate( 'There was an error updating @%(user)s', {
						args: { user: user.login },
						context: 'Error message after A site has failed to perform actions on a user.',
					} ),
					{ id: 'update-user-notice' }
				)
			);
		},
	} );

	return <Component { ...props } updateUser={ updateUser } isUpdating={ isLoading } />;
};

export default withUpdateUser;
