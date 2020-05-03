/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';
import { CompactCard as Card } from '@automattic/components';
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import {
	areAllUsersValid,
	GSuiteNewUser,
	GSuiteNewUserField,
	newUsers,
} from 'lib/gsuite/new-users';

const domainOne = { name: 'example.blog' };
const domainTwo = { name: 'test.blog' };

const GSuiteNewUserListExample = () => {
	const [ users, setUsers ] = useState( newUsers( domainOne.name ) );
	const [ domains, setDomains ] = useState( [ domainOne ] );
	const [ useMultipleDomains, setUseMultipleDomains ] = useState( false );
	const [ useExtraValidation, setUseExtraValidation ] = useState( false );

	const toggleUseMultipleDomains = () => {
		if ( useMultipleDomains ) {
			setDomains( [ domainOne ] );
			setUsers( newUsers( domainOne.name ) );
			setUseMultipleDomains( false );
		} else {
			setDomains( [ domainOne, domainTwo ] );
			setUsers( newUsers( domainOne.name ) );
			setUseMultipleDomains( true );
		}
	};

	const noAs = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
		value,
		error: ! error && value.includes( 'a' ) ? "No a's permitted!" : error,
	} );

	const extraValidation = ( { domain, mailBox, firstName, lastName }: GSuiteNewUser ) => ( {
		firstName: noAs( firstName ),
		lastName: noAs( lastName ),
		domain,
		mailBox,
	} );

	return (
		<Card>
			<GSuiteNewUserList
				domains={ domains }
				extraValidation={ useExtraValidation ? extraValidation : ( user ) => user }
				selectedDomainName={ domainOne.name }
				onUsersChange={ ( changedUsers ) => setUsers( changedUsers ) }
				users={ users }
				onReturnKeyPress={ () => void 0 }
			>
				{ areAllUsersValid( users ) ? (
					<span>
						<span role="img" aria-label="check mark">
							✅
						</span>{ ' ' }
						- All Users Ready
					</span>
				) : (
					<span>
						<span role="img" aria-label="red error x">
							❌
						</span>{ ' ' }
						- Verification Errors
					</span>
				) }
			</GSuiteNewUserList>
			<hr />
			<FormLabel key="mulitple-domains">
				<FormToggle checked={ useMultipleDomains } onChange={ toggleUseMultipleDomains } />{ ' ' }
				<span>{ 'Use multiple domains' }</span>
			</FormLabel>
			<FormLabel key="extra-validation">
				<FormToggle
					checked={ useExtraValidation }
					onChange={ () => setUseExtraValidation( ! useExtraValidation ) }
				/>{ ' ' }
				<span>{ "Use extra validation ( no a's in name )" }</span>
			</FormLabel>
		</Card>
	);
};

export default GSuiteNewUserListExample;
