/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import useDeleteUserMutation from 'calypso/data/users/use-delete-user-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const useSuccessNotice = ( isSuccess, user, isMultisite, siteSlug ) => {
	const showNotice = React.useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		showNotice.current = () => {
			dispatch(
				successNotice(
					isMultisite
						? translate( 'Successfully removed @%(user)s', {
								args: { user: user.login },
								context: 'Success message after a user has been modified.',
						  } )
						: translate( 'Successfully deleted @%(user)s', {
								args: { user: user.login },
								context: 'Success message after a user has been modified.',
						  } ),
					{ id: 'delete-user-notice', displayOnNextPage: true }
				)
			);
			page.redirect( `/people/team${ siteSlug ? `/${ siteSlug }` : '' }` );
		};
	} );

	React.useEffect( () => {
		isSuccess && showNotice.current();
	}, [ isSuccess ] );
};

const useErrorNotice = ( isError, user, isMultisite, error ) => {
	const showDomainErrorNotice = React.useRef();
	const showGeneralErrorNotice = React.useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		showDomainErrorNotice.current = ( domainError ) => {
			const numDomains = domainError.message.split( ',' ).length;
			dispatch(
				errorNotice(
					translate(
						'@%(user)s owns following domain used on this site: {{strong}}%(domains)s{{/strong}}. This domain will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
						'@%(user)s owns following domains used on this site: {{strong}}%(domains)s{{/strong}}. These domains will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
						{
							count: numDomains,
							args: {
								domains: domainError.message,
								user: user.login,
							},
							components: {
								strong: <strong />,
							},
						}
					),
					{ id: 'delete-user-notice' }
				)
			);
		};

		showGeneralErrorNotice.current = () => {
			dispatch(
				errorNotice(
					isMultisite
						? translate( 'There was an error removing @%(user)s', {
								args: { user: user.login },
								context: 'Error message after A site has failed to perform actions on a user.',
						  } )
						: translate( 'There was an error deleting @%(user)s', {
								args: { user: user.login },
								context: 'Error message after A site has failed to perform actions on a user.',
						  } ),
					{ id: 'delete-user-notice' }
				)
			);
		};
	}, [ dispatch, isMultisite, translate, user.login ] );

	React.useEffect( () => {
		if ( isError ) {
			if ( 'user_owns_domain_subscription' === error.error ) {
				showDomainErrorNotice.current( error );
				return;
			}
			showGeneralErrorNotice.current();
		}
	}, [ isError, error ] );
};

const withDeleteUser = ( Component ) => ( props ) => {
	const { siteId, user, isMultisite, siteSlug } = props;
	const { deleteUser, isSuccess, isError, error } = useDeleteUserMutation( siteId );

	useSuccessNotice( isSuccess, user, isMultisite, siteSlug );
	useErrorNotice( isError, user, isMultisite, error );

	return <Component { ...props } deleteUser={ deleteUser } />;
};

export default withDeleteUser;
