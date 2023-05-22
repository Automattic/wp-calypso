import { css, keyframes } from '@emotion/css';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import Notice from 'calypso/components/notice';

const spinningSyncIcon = keyframes( {
	from: {
		transform: 'rotate(0deg)',
	},
	to: {
		transform: 'rotate(360deg)',
	},
} );

const hostingActivatingNotice = css( {
	'.gridicons-sync > use:first-child, .gridicons-sync > g:first-child': {
		animation: `${ spinningSyncIcon } linear 2s infinite`,
		transformOrigin: 'center',
	},
} );

type SitesTransferNoticeProps = {
	isTransfering: boolean;
	hasError?: boolean;
	isCompact?: boolean;
};

export const SitesTransferNotice = ( {
	isTransfering = false,
	hasError = false,
	isCompact = false,
}: SitesTransferNoticeProps ) => {
	const { __ } = useI18n();

	let status;
	let icon;
	let text;

	if ( hasError ) {
		status = 'is-error';
		icon = 'notice';
		text = isCompact ? __( 'Error' ) : __( 'An error occurred during transfer.' );
	} else {
		status = isTransfering ? 'is-info' : 'is-success';
		icon = isTransfering ? 'sync' : 'checkmark';
		if ( isCompact ) {
			text = isTransfering ? __( 'Activating.' ) : __( 'Activated!' );
		} else {
			text = isTransfering ? __( 'Activating site! Please wait.' ) : __( 'Site activated!' );
		}
	}

	return (
		<Notice
			className={ classnames( { [ hostingActivatingNotice ]: isTransfering } ) }
			status={ status }
			showDismiss={ false }
			isCompact={ isCompact }
			icon={ icon }
			text={ text }
		/>
	);
};
