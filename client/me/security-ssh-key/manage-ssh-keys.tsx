import { Button, CompactCard } from '@automattic/components';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import accept from 'calypso/lib/accept';
import { SSHKeyData } from './use-ssh-key-query';

type SSHKeyProps = { sshKey: SSHKeyData } & Pick<
	ManageSSHKeyProps,
	'userLogin' | 'onDelete' | 'keyBeingDeleted' | 'onUpdate'
>;

const SSHKeyItemCard = styled( CompactCard )( {
	display: 'flex',
	alignItems: 'center',
} );

const SSHKeyName = styled.span( {
	display: 'block',
	fontWeight: 'bold',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
} );

const SSHPublicKey = styled.code( {
	flex: 1,
	position: 'relative',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} );

const SSHKeyAddedDate = styled.span( {
	display: 'block',
	fontStyle: 'italic',
	fontSize: '0.875rem',
	color: 'var( --color-text-subtle )',
} );

const SSHKey = ( { userLogin, sshKey, onDelete, onUpdate, keyBeingDeleted }: SSHKeyProps ) => {
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
		accept(
			__( 'Are you sure you want to update this SSH key? It will affect all attached sites.' ),
			( updated: boolean ) => {
				if ( updated ) {
					onUpdate( sshKey.name );
				}
			}
		);
	};

	return (
		<SSHKeyItemCard>
			<div style={ { marginRight: '1rem' } }>
				<SSHKeyName>
					{ userLogin }-{ sshKey.name }
				</SSHKeyName>
				<SSHPublicKey>{ sshKey.sha256 }</SSHPublicKey>
				<SSHKeyAddedDate>
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
				</SSHKeyAddedDate>
			</div>
			<Button primary={ true } onClick={ handleUpdateClick } style={ { marginLeft: 'auto' } }>
				{ __( 'Update SSH key' ) }
			</Button>
			<Button
				busy={ keyBeingDeleted === sshKey.name }
				disabled={ !! keyBeingDeleted }
				scary
				onClick={ handleDeleteClick }
				style={ { marginLeft: '10px' } }
			>
				{ __( 'Remove SSH key' ) }
			</Button>
		</SSHKeyItemCard>
	);
};

interface ManageSSHKeyProps {
	sshKeys: SSHKeyData[];
	onDelete( name: string ): void;
	onUpdate( name: string ): void;
	keyBeingDeleted: string | null;
	userLogin: string;
}

export const ManageSSHKeys = ( {
	userLogin,
	sshKeys,
	onDelete,
	onUpdate,
	keyBeingDeleted,
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
				/>
			) ) }
		</>
	);
};
