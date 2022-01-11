import { CompactCard as Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useState } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import {
	areAllUsersValid,
	GSuiteNewUser,
	GSuiteNewUserField,
	newUsers,
} from 'calypso/lib/gsuite/new-users';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

const domainOne: SiteDomain = {
	name: 'example.blog',
	domain: 'example.blog',
	supportsGdprConsentManagement: true,
};
const domainTwo: SiteDomain = {
	name: 'test.blog',
	domain: 'test.blog',
	supportsGdprConsentManagement: true,
};

function GSuiteNewUserListExample(): JSX.Element {
	const [ users, setUsers ] = useState( newUsers( domainOne.name ?? '' ) );
	const [ domains, setDomains ] = useState( [ domainOne ] );
	const [ useMultipleDomains, setUseMultipleDomains ] = useState( false );
	const [ useExtraValidation, setUseExtraValidation ] = useState( false );

	const toggleUseMultipleDomains = () => {
		if ( useMultipleDomains ) {
			setDomains( [ domainOne ] );
			setUsers( newUsers( domainOne.name ?? '' ) );
			setUseMultipleDomains( false );
		} else {
			setDomains( [ domainOne, domainTwo ] );
			setUsers( newUsers( domainOne.name ?? '' ) );
			setUseMultipleDomains( true );
		}
	};

	const noAs = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
		value,
		error: ! error && value.includes( 'a' ) ? "No a's permitted!" : error,
	} );

	const extraValidation = ( {
		uuid,
		domain,
		mailBox,
		firstName,
		lastName,
	}: GSuiteNewUser ): GSuiteNewUser => ( {
		uuid,
		firstName: noAs( firstName ),
		lastName: noAs( lastName ),
		domain,
		mailBox,
		password: { value: '', error: null },
	} );

	return (
		<Card>
			<GSuiteNewUserList
				domains={ domains }
				extraValidation={ useExtraValidation ? extraValidation : ( user ) => user }
				selectedDomainName={ domainOne.name ?? '' }
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
				<ToggleControl
					checked={ useMultipleDomains }
					onChange={ toggleUseMultipleDomains }
					label="Use multiple domains"
				/>
			</FormLabel>
			<FormLabel key="extra-validation">
				<ToggleControl
					checked={ useExtraValidation }
					onChange={ () => setUseExtraValidation( ! useExtraValidation ) }
					label="Use extra validation ( no a's in name )"
				/>
			</FormLabel>
		</Card>
	);
}

export default GSuiteNewUserListExample;
