import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useCancelMemberInviteMutation from 'calypso/a8c-for-agencies/data/team/use-cancel-member-invite';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { TeamMember } from '../types';

type Props = {
	onRefetchList?: () => void;
};

export default function useHandleMemberAction( { onRefetchList }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: cancelMemberInvite } = useCancelMemberInviteMutation();

	return useCallback(
		( action: string, item: TeamMember ) => {
			if ( action === 'cancel-user-invite' ) {
				cancelMemberInvite(
					{ id: item.id },
					{
						onSuccess: () => {
							dispatch(
								successNotice( translate( 'The invitation has been successfully cancelled.' ), {
									id: 'cancel-user-invite-success',
									duration: 5000,
								} )
							);
							onRefetchList?.();
						},

						onError: ( error ) => {
							dispatch( errorNotice( error.message ) );
						},
					}
				);
			}
		},
		[ cancelMemberInvite, dispatch, onRefetchList, translate ]
	);
}
