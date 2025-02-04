import { useI18n } from '@wordpress/react-i18n';
import { useSSHKeyQuery } from 'calypso/me/security-ssh-key/use-ssh-key-query';
import { getOKIcon, getPendingIcon } from './icons';
import SecurityCheckupNavigationItem from './navigation-item';

export const SecurityCheckupSSHKey = () => {
	const { data, isLoading } = useSSHKeyQuery();
	const hasSSHKey = !! data && data.length > 0;

	const { __ } = useI18n();

	if ( isLoading ) {
		return <SecurityCheckupNavigationItem isPlaceholder />;
	}

	return (
		<SecurityCheckupNavigationItem
			path="/me/security/ssh-key"
			materialIcon={ hasSSHKey ? getOKIcon() : getPendingIcon() }
			text={ __( 'SSH Key' ) }
			description={
				hasSSHKey
					? __( 'You have a SSH key added to your account.' )
					: __( 'You do not have a SSH key added to your account (optional).' )
			}
		/>
	);
};
