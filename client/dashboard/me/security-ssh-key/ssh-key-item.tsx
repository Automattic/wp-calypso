import { formatNumber } from '@automattic/number-formatters';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useIntlLocale } from '../../app/locale';
import { ActionList } from '../../components/action-list';
import { getSshKeyLabel } from '../../utils/ssh';
import type { UserSshKey } from '@automattic/api-core';

export default function SshKeyItem( {
	sshKey,
	onEdit,
	onDelete,
}: {
	sshKey: UserSshKey;
	onEdit: () => void;
	onDelete: () => void;
} ) {
	const userLocale = useIntlLocale();
	const label = getSshKeyLabel( sshKey );
	const siteCount = sshKey.site_ids?.length ?? 0;

	const addedOn = sprintf(
		/* translators: %s is the date the SSH key was added. */
		__( 'Added on %s' ),
		new Intl.DateTimeFormat( userLocale, { dateStyle: 'long' } ).format(
			new Date( sshKey.created_at )
		)
	);

	const attachedTo = siteCount
		? sprintf(
				/* translators: %s is the number of sites. */
				_n( 'Attached to %s site', 'Attached to %s sites', siteCount ),
				formatNumber( siteCount )
			)
		: __( 'Not attached to any sites' );

	return (
		<ActionList.ActionItem
			title={ label }
			description={
				<VStack spacing={ 2 } alignment="flex-start">
					<Text variant="muted" lineHeight="20px" size="13px" style={ { wordBreak: 'break-all' } }>
						{ sshKey.sha256 }
					</Text>
					<Text variant="muted" lineHeight="20px" size="13px">
						{ attachedTo }
					</Text>
					<Badge intent="informational">{ addedOn }</Badge>
				</VStack>
			}
			actions={
				<DropdownMenu
					toggleProps={ { __next40pxDefaultSize: true, size: 'compact' } }
					icon={ moreVertical }
					label={ sprintf(
						/* translators: %s is the SSH key label. */
						__( 'Actions for %s' ),
						label
					) }
				>
					{ ( { onClose } ) => (
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									onEdit();
									onClose();
								} }
							>
								{ __( 'Edit' ) }
							</MenuItem>
							<MenuItem
								isDestructive
								onClick={ () => {
									onDelete();
									onClose();
								} }
							>
								{ __( 'Delete' ) }
							</MenuItem>
						</MenuGroup>
					) }
				</DropdownMenu>
			}
		/>
	);
}
