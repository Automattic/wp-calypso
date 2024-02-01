import { CompactCard } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { getRole, getRoleBadgeText, renderNameOrEmail } from './utils';
import type { Member } from '@automattic/data-stores';

interface UserListItemProps {
	user: Member;
	isExternalContributor: boolean;
	isP2Guest: boolean;
}

const UserListItem = ( { user, isExternalContributor, isP2Guest }: UserListItemProps ) => {
	if ( ! user ) {
		return null;
	}

	const renderRole = ( user: Member ) => {
		let contractorBadge;
		let superAdminBadge;
		let roleBadge;
		let p2GuestBadge;

		if ( ! user ) {
			return null;
		}

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
				<div className={ classNames( 'imported-user-item__role', `role-${ role }` ) }>
					{ roleText }
				</div>
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
			<CheckboxControl
				checked={ true }
				onChange={ ( isChecked ) => console.log( 'ischecked', isChecked ) }
			/>
			<div className="imported-user-item__user-info">
				<div className="imported-user-item__display-name">{ renderNameOrEmail( user ) }</div>
				<div className="imported-user-item__email">{ user.email }</div>
			</div>
			{ renderRole( user ) }
		</CompactCard>
	);
};

export default UserListItem;
