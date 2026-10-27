import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, pending } from '@wordpress/icons';
import { getModerateCommentsLink } from '../../../panel/helpers/notes';
import type { Note } from '../../types';

export default function PendingApproval( { note }: { note: Note } ) {
	const url = getModerateCommentsLink( note );
	const label = __( 'Pending approval' );

	return (
		<HStack
			className="wpnc-simplified__pending-approval"
			alignment="baseline"
			justify="flex-start"
			spacing={ 1 }
			expanded={ false }
		>
			<Icon icon={ pending } size={ 20 } />
			{ url ? (
				<a href={ url } target="_blank" rel="noreferrer">
					{ label }
				</a>
			) : (
				<span>{ label }</span>
			) }
		</HStack>
	);
}
