import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import type { TeamActionRequest } from 'calypso/dashboard/agency/team/dataviews/actions';

export type { TeamActionRequest };

export default function TeamActionDialog( {
	request,
	onClose,
	onRefresh,
}: {
	request: TeamActionRequest;
	onClose: () => void;
	onRefresh?: () => void;
} ) {
	const translate = useTranslate();
	const handleAction = useHandleMemberAction( { onRefetchList: onRefresh } );
	const agency = useSelector( getActiveAgency );

	const [ isLoading, setIsLoading ] = useState( false );

	const memberName = request.member.displayName ?? request.member.email;

	const runAction = ( actionName: string ) => () => {
		setIsLoading( true );
		handleAction( actionName, request.member, () => {
			setIsLoading( false );
			onClose();
		} );
	};

	if ( request.kind === 'cancel-invite' ) {
		return (
			<A4AConfirmationDialog
				title={ translate( 'Cancel invitation' ) }
				ctaLabel={ translate( 'Cancel invitation' ) }
				isDestructive
				isLoading={ isLoading }
				isDisabled={ isLoading }
				onClose={ onClose }
				onConfirm={ runAction( 'cancel-user-invite' ) }
			>
				{ translate(
					'Are you sure you want to cancel the invitation for {{b}}%(memberName)s{{/b}}?',
					{
						args: { memberName },
						components: { b: <b /> },
						comment: '%(memberName)s is the member name',
					}
				) }
			</A4AConfirmationDialog>
		);
	}

	if ( request.kind === 'transfer-ownership' ) {
		return (
			<A4AConfirmationDialog
				title={ translate( 'Transfer agency ownership' ) }
				ctaLabel={ translate( 'Transfer ownership' ) }
				isLoading={ isLoading }
				isDisabled={ isLoading }
				onClose={ onClose }
				onConfirm={ runAction( 'transfer-ownership' ) }
			>
				{ translate(
					'Are you sure you want to transfer ownership of %(agencyName)s to {{b}}%(memberName)s{{/b}}? {{br/}}This action cannot be undone and you will become a regular team member.',
					{
						args: { agencyName: agency?.name ?? '', memberName },
						components: { b: <b />, br: <br /> },
						comment: '%(agencyName)s is the agency name, %(memberName)s is the member name',
					}
				) }
			</A4AConfirmationDialog>
		);
	}

	const title = request.isSelf
		? ( translate( 'Are you sure you want to leave %(agencyName)s?', {
				args: { agencyName: agency?.name ?? '' },
				comment: '%(agencyName)s is the agency name',
		  } ) as string )
		: translate( 'Remove team member' );

	return (
		<A4AConfirmationDialog
			title={ title }
			ctaLabel={ request.isSelf ? translate( 'Leave agency' ) : translate( 'Remove team member' ) }
			isDestructive
			isLoading={ isLoading }
			isDisabled={ isLoading }
			onClose={ onClose }
			onConfirm={ runAction( 'delete-user' ) }
		>
			{ request.isSelf
				? translate(
						"By proceeding, you'll lose management access of all sites that belong to this agency and you will be removed from this dashboard. {{br/}}The agency owner will need to re-invite you if you wish to gain access again.",
						{ components: { br: <br /> } }
				  )
				: translate( 'Are you sure you want to remove {{b}}%(memberName)s{{/b}}?', {
						args: { memberName },
						components: { b: <b /> },
						comment: '%(memberName)s is the member name',
				  } ) }
		</A4AConfirmationDialog>
	);
}
