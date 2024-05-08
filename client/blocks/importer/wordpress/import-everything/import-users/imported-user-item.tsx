import { CompactCard } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { getRole, getRoleBadgeText, getNameOrEmail } from './utils';
import type { Member } from '@automattic/data-stores';

interface ImportedUserItemProps {
	user: Member;
	isChecked: boolean;
	isExternalContributor: boolean;
	isP2Guest: boolean;
	onChangeChecked: ( isChecked: boolean ) => void;
}

const ImportedUserItem = ( {
	user,
	isChecked,
	isExternalContributor,
	isP2Guest,
	onChangeChecked,
}: ImportedUserItemProps ) => {
	const [ isCheckedState, setIsCheckedState ] = useState( isChecked );

	if ( ! user ) {
		return null;
	}

	const handleOnCheckChange = ( checked: boolean ) => {
		setIsCheckedState( checked );
		onChangeChecked( checked );
	};

	const renderRole = ( user: Member ) => {
		let contractorBadge;
		let superAdminBadge;
		let roleBadge;
		let p2GuestBadge;

		if ( user && user.is_super_admin ) {
			superAdminBadge = (
				<div className="imported-user-item__role role-super-admin">
					{ getRoleBadgeText( 'super-admin' ) }
				</div>
			);
		}

		const role = getRole( user );
		const roleText = getRoleBadgeText( role );

		if ( role && roleText ) {
			roleBadge = (
				<div className={ clsx( 'imported-user-item__role', `role-${ role }` ) }>{ roleText }</div>
			);
		}

		if ( isExternalContributor ) {
			contractorBadge = (
				<div className="imported-user-item__role role-contractor">
					{ translate( 'Contractor' ) }
				</div>
			);
		}

		if ( isP2Guest ) {
			p2GuestBadge = (
				<div className="imported-user-item__role role-p2-guest">{ translate( 'Guest' ) }</div>
			);
		}

		if ( ! roleBadge && ! superAdminBadge && ! contractorBadge && ! p2GuestBadge ) {
			return null;
		}

		return (
			<div className="imported-user-item__roles">
				{ superAdminBadge }
				{ roleBadge }
				{ contractorBadge }
				{ p2GuestBadge }
			</div>
		);
	};

	return (
		<CompactCard className="imported-user-item">
			<CheckboxControl checked={ isCheckedState } onChange={ handleOnCheckChange } />
			<div className="imported-user-item__user-info">
				<div className="imported-user-item__display-name">{ getNameOrEmail( user ) }</div>
				<div className="imported-user-item__email">{ user.email }</div>
			</div>
			{ user && renderRole( user ) }
		</CompactCard>
	);
};

export default ImportedUserItem;
