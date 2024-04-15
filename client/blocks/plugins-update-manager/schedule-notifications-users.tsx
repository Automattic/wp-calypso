import { CheckboxControl, SearchControl, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useSiteSlug } from 'calypso/blocks/plugins-update-manager/hooks/use-site-slug';
import useUsersQuery from 'calypso/data/users/use-users-query';

type Props = {
	initUsers?: number[];
	onChange?: ( userIds: number[] ) => void;
};

type User = {
	ID: number;
	name: string;
};

export const ScheduleNotificationsUsers = ( { initUsers = [], onChange }: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();

	const [ userSearchTerm, setUserSearchTerm ] = useState( '' );
	const [ selectedUsers, setSelectedUsers ] = useState< number[] >( initUsers );

	const {
		data: userPages,
		isLoading: isUsersLoading,
		isFetched: isUsersFetched,
	} = useUsersQuery( siteSlug, { capabilities: [ 'update_plugins' ] } );
	const users = userPages?.pages
		?.reduce( ( acc, page ) => [ ...acc, ...page.users ], [] )
		.sort( ( a: User, b: User ) => a.name.localeCompare( b.name ) );

	const onUsersSelectAllChange = useCallback(
		( isChecked: boolean ) => {
			isChecked
				? setSelectedUsers( users?.map( ( user: User ) => user.ID ) ?? [] )
				: setSelectedUsers( [] );
		},
		[ users ]
	);

	const onUsersSelectionChange = useCallback(
		( user: User, isChecked: boolean ) => {
			if ( isChecked ) {
				const _users: number[] = [ ...selectedUsers ];
				_users.push( user.ID );
				setSelectedUsers( _users );
			} else {
				setSelectedUsers( selectedUsers.filter( ( id ) => id !== user.ID ) );
			}
		},
		[ selectedUsers ]
	);

	useEffect( () => onChange?.( selectedUsers ), [ selectedUsers, onChange ] );

	return (
		<div className="form-field">
			<label htmlFor="users">{ translate( 'Select users' ) }</label>

			<div className="checkbox-options">
				<SearchControl id="users" onChange={ setUserSearchTerm } value={ userSearchTerm } />
				<div className="checkbox-options-container">
					{ isUsersLoading && <Spinner /> }
					{ isUsersFetched && (
						<CheckboxControl
							label={ translate( 'Select all' ) }
							indeterminate={ selectedUsers.length > 0 && selectedUsers.length < users?.length }
							checked={ selectedUsers.length === users?.length }
							onChange={ onUsersSelectAllChange }
						/>
					) }
					{ isUsersFetched &&
						users.map( ( user: User ) => (
							<Fragment key={ user.ID }>
								{ user.name?.toLowerCase().includes( userSearchTerm?.toLowerCase() ) && (
									<CheckboxControl
										label={ user.name }
										checked={ selectedUsers.includes( user.ID ) }
										onChange={ ( isChecked ) => {
											onUsersSelectionChange( user, isChecked );
										} }
									/>
								) }
							</Fragment>
						) ) }
				</div>
			</div>
		</div>
	);
};
