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
	const domainName = '' !== selectedDomainName ? selectedDomainName : domains[ 0 ].domain;

	const onUserValueChange = index => ( field, value ) => {
		const modifiedUser = extraValidation(
			validateUser( { ...users[ index ], [ field ]: { value, error: null } } )
		);

		onUsersChange(
			users.map( ( user, userIndex ) => ( userIndex === index ? modifiedUser : user ) )
		);
	};

	const onUserAdd = () => {
		onUsersChange( [ ...users, newUser( domainName ) ] );
	};

	const onUserRemove = index => () => {
		const newUserList = users.filter( ( user, userIndex ) => userIndex !== index );
		onUsersChange( 0 < newUserList.length ? newUserList : [ newUser( domainName ) ] );
	};

	return (
		<div>
			{ users
				.map( ( user, index ) => (
					<GSuiteNewUser
						key={ `${ index }-body` }
						domains={ domains }
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
	domains: PropTypes.array.isRequired,
	extraValidation: PropTypes.func.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	onUsersChange: PropTypes.func,
	users: PropTypes.arrayOf( userShape ).isRequired,
};

GSuiteNewUserList.defaultProps = {
	extraValidation: user => user,
};

export default GSuiteNewUserList;
