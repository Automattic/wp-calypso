import { Button, CompactCard } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import accept from 'calypso/lib/accept';
import { SSHKeyData } from './use-ssh-key-query';

type SSHKeyProps = { sshKey: SSHKeyData } & Pick< ManageSSHKeyProps, 'onDelete' >;

const SSHKeyItemCard = styled( CompactCard )( {
	display: 'flex',
	alignItems: 'center',
} );

const SSHPublicKey = styled.code( {
	flex: 1,
	position: 'relative',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	marginRight: '1rem',
} );

const SSHKey = ( { sshKey, onDelete }: SSHKeyProps ) => {
	const { __ } = useI18n();
	const handleDeleteClick = () => {
		accept( __( 'Are you sure you want to remove this SSH key?' ), ( accepted: boolean ) => {
			if ( accepted ) {
				onDelete( sshKey.name );
			}
		} );
	};

	return (
		<SSHKeyItemCard>
			<SSHPublicKey>{ sshKey.key }</SSHPublicKey>
			<Button scary onClick={ handleDeleteClick } style={ { marginLeft: 'auto' } }>
				{ __( 'Remove SSH key' ) }
			</Button>
		</SSHKeyItemCard>
	);
};

interface ManageSSHKeyProps {
	sshKeys: SSHKeyData[];
	onDelete( name: string ): void;
}

export const ManageSSHKeys = ( { sshKeys, onDelete }: ManageSSHKeyProps ) => {
	return (
		<>
			{ sshKeys.map( ( sshKey ) => (
				<SSHKey key={ sshKey.key } sshKey={ sshKey } onDelete={ onDelete } />
			) ) }
		</>
	);
};
