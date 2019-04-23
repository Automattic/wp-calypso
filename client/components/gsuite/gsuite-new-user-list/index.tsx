/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GSuiteNewUser from './new-user';
import { newUser, userShape, validateUser } from 'lib/gsuite/new-users';

const GSuiteNewUserList = ( {
	domains,
	extraValidation,
	selectedDomainName,
	onUsersChange,
	users,
} ) => {
	const translate = useTranslate();

	const onUserValueChange = index => ( field, value ) => {
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

	const onUserRemove = index => () => {
		const newUserList = users.filter( ( user, userIndex ) => userIndex !== index );
		onUsersChange( 0 < newUserList.length ? newUserList : [ newUser( selectedDomainName ) ] );
	};

	return (
		<div>
			{ users
				.map( ( user, index ) => (
					<GSuiteNewUser
						key={ `${ index }-body` }
						domains={ domains ? domains.map( domain => domain.name ) : [ selectedDomainName ] }
						user={ user }
						onUserValueChange={ onUserValueChange( index ) }
						onUserRemove={ onUserRemove( index ) }
					/>
				) )
				.reduce(
					( accumulator, current, index ) =>
						0 === accumulator.length
							? [ current ]
							: [ ...accumulator, <hr key={ `${ index }-hr` } />, current ],
					[]
				) }
			<button onClick={ onUserAdd }>
				<Gridicon icon="plus" />
				{ translate( 'Add Another User' ) }
			</button>
		</div>
	);
};

GSuiteNewUserList.propTypes = {
	domains: PropTypes.array,
	extraValidation: PropTypes.func.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	onUsersChange: PropTypes.func,
	users: PropTypes.arrayOf( userShape ).isRequired,
};

GSuiteNewUserList.defaultProps = {
	extraValidation: user => user,
};

export default GSuiteNewUserList;
