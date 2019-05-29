/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import GSuiteNewUser from './new-user';
import { newUser, GSuiteNewUser as NewUser, validateUser } from 'lib/gsuite/new-users';

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
	users: NewUser[];
}

const GSuiteNewUserList: FunctionComponent< Props > = ( {
	children,
	domains,
	extraValidation,
	selectedDomainName,
	onUsersChange,
	users,
} ) => {
	const translate = useTranslate();

	const onUserValueChange = ( index: number ) => ( field: string, value: string ) => {
		const modifiedUser = extraValidation(
			validateUser( { ...users[ index ], [ field ]: { value, error: null } } )
		);

		onUsersChange(
			users.map( ( user, userIndex ) => ( userIndex === index ? modifiedUser : user ) )
		);
	};

	const onUserAdd = () => {
		onUsersChange( [ ...users, newUser( selectedDomainName ) ] );
	};

	const onUserRemove = ( index: number ) => () => {
		const newUserList = users.filter( ( _user, userIndex ) => userIndex !== index );
		onUsersChange( 0 < newUserList.length ? newUserList : [ newUser( selectedDomainName ) ] );
	};

	return (
		<div>
			{ users.map( ( user, index ) => (
				<Fragment key={ index }>
					<GSuiteNewUser
						domains={ domains ? domains.map( domain => domain.name ) : [ selectedDomainName ] }
						user={ user }
						onUserValueChange={ onUserValueChange( index ) }
						onUserRemove={ onUserRemove( index ) }
					/>
					<hr className="gsuite-new-user-list__user-divider" />
				</Fragment>
			) ) }
			<div className="gsuite-new-user-list__actions">
				<Button className="gsuite-new-user-list__add-another-user-button" onClick={ onUserAdd }>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add Another User' ) }</span>
				</Button>
				{ children }
			</div>
		</div>
	);
};

export default GSuiteNewUserList;
