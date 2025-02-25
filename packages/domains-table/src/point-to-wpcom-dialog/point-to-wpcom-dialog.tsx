import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
// eslint-disable-next-line no-restricted-imports
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

type PointToWpcomDialogProps = {
	visible: boolean;
	domain: string;
	onClose: () => void;
};

export const PointToWpcomDialog = ( { visible, domain, onClose }: PointToWpcomDialogProps ) => {
	const { __ } = useI18n();
	const [ isLoading, setIsLoading ] = useState( false );
	const dispatch = useDispatch();

	const handleClick = async () => {
		setIsLoading( true );
		try {
			await wpcomRequest( {
				path: '/domains/point-to-wpcom',
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: {
					domain,
				},
			} );
			dispatch( successNotice( __( 'Domain pointed to WordPress.com' ) ) );
		} catch ( error ) {
			dispatch( errorNotice( __( 'Error pointing domain to WordPress.com' ) ) );
		} finally {
			setIsLoading( false );
			onClose();
		}
	};

	const renderButtons = () => {
		return [
			{
				action: 'cancel',
				label: __( 'Cancel' ),
				onClick: onClose,
				disabled: isLoading,
			},
			{
				action: 'submit',
				label: __( 'Confirm' ),
				isPrimary: true,
				onClick: handleClick,
				disabled: isLoading,
				additionalClassNames: isLoading ? 'is-busy' : '',
			},
		];
	};
	return (
		<Dialog isVisible={ visible } onClose={ onClose } buttons={ renderButtons() }>
			<h1>Point to WordPress.com</h1>
			<p>You can point your domain to WordPress.com to use it as a site address.</p>
		</Dialog>
	);
};

export default PointToWpcomDialog;
