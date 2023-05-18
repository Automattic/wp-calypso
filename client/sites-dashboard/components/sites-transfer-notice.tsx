import { css, keyframes } from '@emotion/css';
import styled from '@emotion/styled';
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

const LoaderNoticeContainer = styled.div( {
	position: 'absolute',
	top: 0,
	left: 0,
	padding: 6,
	width: '100%',
	boxSizing: 'border-box',
	'.notice__text': {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
} );

type SitesTransferNoticeProps = {
	isTransfering: boolean;
	hasError?: boolean;
};

export const SitesTransferNotice = ( {
	isTransfering = false,
	hasError = false,
}: SitesTransferNoticeProps ) => {
	const { __ } = useI18n();

	let status;
	let icon;
	let text;

	if ( hasError ) {
		status = 'is-error';
		icon = 'notice';
		text = __( 'An error occurred during transfer.' );
	} else {
		status = isTransfering ? 'is-info' : 'is-success';
		icon = isTransfering ? 'sync' : 'checkmark';
		text = isTransfering ? __( 'Activating site! Please wait.' ) : __( 'Site activated!' );
	}

	return (
		<LoaderNoticeContainer>
			<Notice
				className={ classnames( { [ hostingActivatingNotice ]: isTransfering } ) }
				status={ status }
				showDismiss={ false }
				icon={ icon }
				text={ text }
			/>
		</LoaderNoticeContainer>
	);
};
