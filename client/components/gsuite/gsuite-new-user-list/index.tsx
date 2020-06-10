/**
 * External dependencies
 */
import Gridicon from 'components/gridicon';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import GSuiteNewUser from './new-user';
import { newUser, GSuiteNewUser as NewUser, validateUsers } from 'lib/gsuite/new-users';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	children?: ReactNode;
	domains: any[];
	extraValidation: ( user: NewUser ) => NewUser;
	selectedDomainName: string;
	onUsersChange: ( users: NewUser[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	users: NewUser[];
}

const GSuiteNewUserList: FunctionComponent< Props > = ( {
	children,
	domains,
	extraValidation,
	selectedDomainName,
	onUsersChange,
	users,
	onReturnKeyPress,
} ) => {
	const translate = useTranslate();

	const onUserValueChange = ( uuid: string ) => ( fieldName: string, fieldValue: string ) => {
		const modifiedUserList = users.map( user => {
			if ( user.uuid !== uuid ) {
				return user;
			}

			return { ...user, [ fieldName ]: { value: fieldValue, error: null } };
		} );

		onUsersChange( validateUsers( modifiedUserList, extraValidation ) );
	};

	const onUserAdd = () => {
		onUsersChange( [ ...users, newUser( selectedDomainName ) ] );
	};

	const onUserRemove = ( uuid: string ) => () => {
		const newUserList = users.filter( ( _user ) => _user.uuid !== uuid );

		onUsersChange( 0 < newUserList.length ? newUserList : [ newUser( selectedDomainName ) ] );
	};

	return (
		<div>
			{ users.map( ( user ) => (
				<Fragment key={ user.uuid }>
					<GSuiteNewUser
						domains={ domains ? domains.map( ( domain ) => domain.name ) : [ selectedDomainName ] }
						user={ user }
						onUserValueChange={ onUserValueChange( user.uuid ) }
						onUserRemove={ onUserRemove( user.uuid ) }
						onReturnKeyPress={ onReturnKeyPress }
					/>

					<hr className="gsuite-new-user-list__user-divider" />
				</Fragment>
			) ) }

			<div className="gsuite-new-user-list__actions">
				<Button className="gsuite-new-user-list__add-another-user-button" onClick={ onUserAdd }>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add another user' ) }</span>
				</Button>

				{ children }
			</div>
		</div>
	);
};

export default GSuiteNewUserList;
