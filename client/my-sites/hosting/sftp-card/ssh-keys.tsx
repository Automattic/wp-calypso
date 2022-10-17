import { Button, Spinner } from '@automattic/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import { useSSHKeyQuery } from 'calypso/me/security-ssh-key/use-ssh-key-query';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import SshKeyCard from './ssh-key-card';
import { useAtomicSshKeys } from './use-atomic-ssh-keys';
import { useAttachSshKeyMutation } from './use-attach-ssh-key';

import './ssh-keys.scss';

interface SshKeysProps {
	siteId: number;
	userId: number | null;
	translate: LocalizeProps[ 'translate' ];
	disabled: boolean;
}

function SshKeys( { translate, siteId, userId, disabled }: SshKeysProps ) {
	const { data: keys, isLoading: isLoadingKeys } = useAtomicSshKeys( siteId, {
		enabled: ! disabled,
	} );
	const { data: userKeys, isLoading: isLoadingUserKeys } = useSSHKeyQuery();
	const { mutate: attachSshKey, isLoading: attachingKey } = useAttachSshKeyMutation( siteId );

	const [ selectedKey, setSelectedKey ] = useState( 'default' );
	function onChangeSelectedKey( event: React.ChangeEvent< HTMLSelectElement > ) {
		setSelectedKey( event.target.value );
	}

	const userKeyIsAttached = useMemo( () => {
		if ( ! userKeys || ! keys ) {
			return false;
		}
		let foundKey = false;
		const siteFigerprints = keys.map( ( { fingerprint } ) => fingerprint );
		for ( const key of userKeys ) {
			if ( siteFigerprints.includes( key.sha256 ) ) {
				foundKey = true;
			}
		}
		return foundKey;
	}, [ keys, userKeys ] );

	const isLoading = isLoadingKeys || isLoadingUserKeys;
	const showKeysSelect = ! isLoading && ! userKeyIsAttached && userKeys && userKeys.length > 0;
	const showLinkToAddUserKey = ! isLoading && ! userKeyIsAttached && userKeys?.length === 0;

	return (
		<div className="ssh-keys">
			<label htmlFor="attach-ssh-key" className="form-label">
				{ translate( 'SSH Keys' ) }
			</label>

			{ keys?.map( ( { name, fingerprint } ) => (
				<SshKeyCard
					key={ fingerprint }
					name={ name }
					fingerprint={ fingerprint }
					deleteText={ translate( 'Detach' ) }
					userId={ userId }
					siteId={ siteId }
				/>
			) ) }

			{ isLoading && <Spinner /> }

			{ showKeysSelect && (
				<FormFieldset className="ssh-keys__form">
					<FormSelect
						id="attach-ssh-key"
						className="ssh-keys__select"
						onChange={ onChangeSelectedKey }
						value={ selectedKey }
					>
						{ userKeys?.map( ( key ) => (
							<option value={ key.name } key={ key.sha256 }>
								{ key.name }
							</option>
						) ) }
					</FormSelect>
					<Button
						primary
						onClick={ () => attachSshKey( { name: selectedKey } ) }
						disabled={ attachingKey }
						busy={ attachingKey }
					>
						<span>{ translate( 'Attach SSH key to site' ) }</span>
					</Button>
				</FormFieldset>
			) }
			{ showLinkToAddUserKey && (
				<div>
					<a href="/me/security/ssh-key">{ translate( 'Add an SSH key to your account' ) }</a>{ ' ' }
					{ translate( 'in order to use it with this site.' ) }
				</div>
			) }
		</div>
	);
}

export default connect( ( state, { siteId }: SshKeysProps ) => {
	return {
		userId: getCurrentUserId( state ),
		siteId,
	};
} )( localize( SshKeys ) );
