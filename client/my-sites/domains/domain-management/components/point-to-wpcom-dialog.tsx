import { useI18n } from '@wordpress/react-i18n';
import AcceptDialog from 'calypso/lib/accept/dialog'; // eslint-disable-line no-restricted-imports

type PointToWpcomDialogProps = {
	visible: boolean;
	onClose: ( accepted: boolean ) => void;
};

export const PointToWpcomDialog = ( { visible, onClose }: PointToWpcomDialogProps ) => {
	const { __ } = useI18n();

	if ( ! visible ) {
		return null;
	}

	const renderContent = () => {
		return (
			<>
				<p>{ __( 'When you point your domain to WordPress.com, we will:' ) }</p>
				<ul>
					<li>{ __( 'Change your name servers to use the WordPress.com defaults,' ) }</li>
					<li>{ __( 'Reset to default A records, and' ) }</li>
					<li>{ __( "Set the default 'www' CNAME records" ) }</li>
				</ul>
				<p>{ __( 'Please note that these changes may take some time to apply.' ) }</p>
			</>
		);
	};

	return (
		<AcceptDialog
			message={ renderContent() }
			onClose={ onClose }
			confirmButtonText={ __( 'Continue' ) }
			cancelButtonText={ __( 'Cancel' ) }
			options={ {
				useModal: true,
				modalOptions: {
					title: __( 'Point to WordPress.com' ),
				},
			} }
		/>
	);
};

export default PointToWpcomDialog;
