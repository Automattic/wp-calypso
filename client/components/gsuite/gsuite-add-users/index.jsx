/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { useState, Fragment } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import GSuiteSingleUserForm from './single-user-form';
import { validateUser } from 'lib/gsuite';

const GSuiteAddUsersA = ( { domains, extraValidation } ) => {
	const translate = useTranslate();

	const newUser = () => ( {
		firstName: {
			value: '',
			error: null,
		},
		lastName: {
			value: '',
			error: null,
		},
		mailBox: {
			value: '',
			error: null,
		},
		domain: {
			value: domains[ 0 ].domain,
			error: null,
		},
	} );

	const [ users, setUsers ] = useState( [ newUser() ] );

	const onUserChange = ( index, field, value ) => {
		const modifiedUser = extraValidation(
			validateUser( { ...users[ index ], [ field ]: { value, error: null } } )
		);

		setUsers( users.map( ( user, userIndex ) => ( userIndex === index ? modifiedUser : user ) ) );
	};

	const onUserAdd = () => {
		setUsers( [ ...users, newUser() ] );
	};

	const onUserRemove = index => {
		setUsers( users.filter( ( user, userIndex ) => userIndex !== index ) );
	};

	const canDeleteUsers = 1 < users.length;

	return (
		<div>
			{ users
				.map( ( user, index ) => {
					return (
						<Fragment key={ `${ index }-body` }>
							<GSuiteSingleUserForm
								domains={ domains }
								user={ user }
								onUserChange={ onUserChange }
								userId={ index }
							/>
							{ canDeleteUsers && (
								<Button
									onClick={ () => {
										onUserRemove( index );
									} }
								>
									<Gridicon icon="trash" />
								</Button>
							) }
						</Fragment>
					);
				} )
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

GSuiteAddUsersA.propTypes = {
	domains: PropTypes.array.isRequired,
	extraValidation: PropTypes.func.isRequired,
};

GSuiteAddUsersA.defaultProps = {
	extraValidation: user => user,
};

export default GSuiteAddUsersA;
