import { useI18n } from '@wordpress/react-i18n';
import AcceptDialog from 'calypso/lib/accept/dialog'; // eslint-disable-line no-restricted-imports

type PointToWpcomDialogProps = {
	visible: boolean;
	onClose: ( accepted: boolean ) => void;
};

export const PointToWpcomDialog = ( { visible, onClose }: PointToWpcomDialogProps ) => {
	const { __ } = useI18n();

	const renderContent = () => {
		return (
			<>
				<p>
					{ __(
						'This action will update your domain settings to point to WordPress.com. Specifically, it will:'
					) }
				</p>
				<ul>
					<li>Set WordPress.com defaults nameservers</li>
					<li>Delete any existing A records</li>
					<li>Delete any existing "www" CNAME record</li>
				</ul>
				<p>
					{ __( 'These changes may take some time to apply. Are you sure you want to proceed?' ) }
				</p>
			</>
		);
	};

	return visible ? (
		<AcceptDialog
			message={ renderContent() }
			onClose={ onClose }
			confirmButtonText={ __( 'Confirm' ) }
			cancelButtonText={ __( 'Cancel' ) }
			options={ {
				useModal: true,
				modalOptions: {
					title: __( 'Point to WordPress.com' ),
				},
			} }
		/>
	) : null;
};

export default PointToWpcomDialog;
