import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { Notice } from '../../components/notice';
import type { ScanStatusType } from './use-scan-state';

interface ScanNoticesProps {
	status: ScanStatusType;
	threatCount: number;
}

export function ScanNotices( { status, threatCount }: ScanNoticesProps ) {
	const [ isDismissed, setIsDismissed ] = useState( false );

	const handleDismiss = () => {
		setIsDismissed( true );
	};

	useEffect( () => {
		// Reset dismissal when a new scan starts
		if ( status === 'running' ) {
			setIsDismissed( false );
		}
	}, [ status ] );

	function NoticeError() {
		return (
			<Notice
				variant="error"
				title={ __( 'Latest scan for your site couldn’t be completed' ) }
				onClose={ handleDismiss }
				actions={
					<Button variant="primary" href={ JETPACK_CONTACT_SUPPORT } target="_blank">
						{ __( 'Contact support' ) }
					</Button>
				}
			>
				{ createInterpolateElement(
					__(
						'Please check to see if your site is down – if it’s not, try again. If it is, or if the scan process is still having problems, <external>check our help guide</external> or contact our support team.'
					),
					{
						external: <ExternalLink href="https://jetpack.com/support/scan/" children={ null } />,
					}
				) }
			</Notice>
		);
	}

	function NoticeSuccess() {
		return (
			<Notice variant="success" title={ __( 'Everything looks great!' ) } onClose={ handleDismiss }>
				{ __( 'Run a manual scan now or wait for Jetpack to scan your site later.' ) }
			</Notice>
		);
	}

	function NoticeWarning() {
		return (
			<Notice
				variant="warning"
				title={ __( 'Active threats were found' ) }
				onClose={ handleDismiss }
			>
				{ __(
					'We found issues on your site that may require your attention. Review the detected threats and take action to keep your site secure.'
				) }
			</Notice>
		);
	}

	if ( isDismissed ) {
		return null;
	}

	if ( status === 'error' ) {
		return <NoticeError />;
	} else if ( status === 'success' ) {
		return threatCount > 0 ? <NoticeWarning /> : <NoticeSuccess />;
	}

	return null;
}
