import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, FunctionComponent, ReactNode } from 'react';
import {
	newUser,
	GSuiteNewUser as NewUser,
	sanitizeEmail,
	validateUsers,
} from 'calypso/lib/gsuite/new-users';
import GSuiteNewUser from './new-user';

import './style.scss';

interface Props {
	autoFocus?: boolean;
	children?: ReactNode;
	domains?: string[];
	extraValidation: ( user: NewUser ) => NewUser;
	selectedDomainName: string;
	onUsersChange: ( users: NewUser[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	users: NewUser[];
}

const GSuiteNewUserList: FunctionComponent< Props > = ( {
	autoFocus = false,
	children,
	domains,
	extraValidation,
	onUsersChange,
	onReturnKeyPress,
	selectedDomainName,
	users,
} ) => {
	const translate = useTranslate();

	const onUserValueChange = ( uuid: string ) => (
		fieldName: string,
		fieldValue: string,
		mailBoxFieldTouched = false
	) => {
		const changedUsers = users.map( ( user ) => {
			if ( user.uuid !== uuid ) {
				return user;
			}

			const changedUser = { ...user, [ fieldName ]: { value: fieldValue, error: null } };

			if ( 'firstName' === fieldName && ! mailBoxFieldTouched ) {
				return { ...changedUser, mailBox: { value: sanitizeEmail( fieldValue ), error: null } };
			}

			return changedUser;
		} );

		onUsersChange( validateUsers( changedUsers, extraValidation ) );
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
			{ users.map( ( user, index ) => (
				<Fragment key={ user.uuid }>
					<GSuiteNewUser
						autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
						domains={ domains ? domains.map( ( domain ) => domain.name ) : [ selectedDomainName ] }
						user={ user }
						onUserValueChange={ onUserValueChange( user.uuid ) }
						onUserRemove={ onUserRemove( user.uuid ) }
						onReturnKeyPress={ onReturnKeyPress }
						selectedDomainName={ selectedDomainName }
						showTrashButton={ index > 0 }
					/>

					<hr className="gsuite-new-user-list__user-divider" />
				</Fragment>
			) ) }

			<div className="gsuite-new-user-list__actions">
				<Button className="gsuite-new-user-list__add-another-user-button" onClick={ onUserAdd }>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add another mailbox' ) }</span>
				</Button>

				{ children }
			</div>
		</div>
	);
};

export default GSuiteNewUserList;
