import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import * as SSHKeyCard from 'calypso/components/ssh-key-card';
import accept from 'calypso/lib/accept';
import { SSHKeyData } from './use-ssh-key-query';

type SSHKeyProps = { sshKey: SSHKeyData } & Pick<
	ManageSSHKeyProps,
	'userLogin' | 'onDelete' | 'keyBeingDeleted' | 'onUpdate' | 'keyBeingUpdated'
>;

const SSHKey = ( {
	userLogin,
	sshKey,
	onDelete,
	onUpdate,
	keyBeingDeleted,
	keyBeingUpdated,
}: SSHKeyProps ) => {
	const { __ } = useI18n();
	const handleDeleteClick = () => {
		accept(
			__(
				'Are you sure you want to remove this SSH key? It will be removed from all attached sites.'
			),
			( accepted: boolean ) => {
				if ( accepted ) {
					onDelete( sshKey.name );
				}
			}
		);
	};

	const handleUpdateClick = () => {
		onUpdate( sshKey.name, sshKey.sha256 );
	};

	const areButtonsDisabled = !! keyBeingDeleted || !! keyBeingUpdated;

	return (
		<SSHKeyCard.Root>
			<SSHKeyCard.Details>
				<SSHKeyCard.KeyName>
					{ userLogin }-{ sshKey.name }
				</SSHKeyCard.KeyName>
				<SSHKeyCard.PublicKey>{ sshKey.sha256 }</SSHKeyCard.PublicKey>
				<SSHKeyCard.Date>
					{ sprintf(
						// translators: addedOn is when the SSH key was added.
						__( 'Added on %(addedOn)s' ),
						{
							addedOn: new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
								dateStyle: 'long',
								timeStyle: 'medium',
							} ).format( new Date( sshKey.created_at ) ),
						}
					) }
				</SSHKeyCard.Date>
			</SSHKeyCard.Details>
			<SSHKeyCard.Button
				primary
				scary={ false }
				disabled={ areButtonsDisabled }
				onClick={ handleUpdateClick }
				style={ { marginInlineStart: 'auto' } }
			>
				{ __( 'Update SSH key' ) }
			</SSHKeyCard.Button>
			<SSHKeyCard.Button
				style={ { marginInlineStart: '10px' } }
				busy={ keyBeingDeleted === sshKey.name }
				disabled={ areButtonsDisabled }
				onClick={ handleDeleteClick }
			>
				{ __( 'Remove SSH key' ) }
			</SSHKeyCard.Button>
		</SSHKeyCard.Root>
	);
};

interface ManageSSHKeyProps {
	sshKeys: SSHKeyData[];
	onDelete( name: string ): void;
	onUpdate( name: string, keyFingerprint: string ): void;
	keyBeingDeleted: string | null;
	keyBeingUpdated: boolean | null;
	userLogin: string;
}

export const ManageSSHKeys = ( {
	userLogin,
	sshKeys,
	onDelete,
	onUpdate,
	keyBeingDeleted,
	keyBeingUpdated,
}: ManageSSHKeyProps ) => {
	return (
		<>
			{ sshKeys.map( ( sshKey ) => (
				<SSHKey
					key={ sshKey.key }
					userLogin={ userLogin }
					sshKey={ sshKey }
					onUpdate={ onUpdate }
					onDelete={ onDelete }
					keyBeingDeleted={ keyBeingDeleted }
					keyBeingUpdated={ keyBeingUpdated }
				/>
			) ) }
		</>
	);
};
