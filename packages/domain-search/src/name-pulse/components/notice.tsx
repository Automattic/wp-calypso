import { Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import type { NamePulseNotice } from '../helpers';

interface NamePulseSearchNoticeProps {
	notice: NamePulseNotice;
	onTransferClick?: ( domainName: string ) => void;
}

/**
 * The single notice above the results. Its own component rather than
 * `DomainSearchNotice` because the design asks for a neutral tone and a
 * trailing action, neither of which the shared notice offers.
 */
export const NamePulseSearchNotice = ( {
	notice,
	onTransferClick,
}: NamePulseSearchNoticeProps ) => {
	const { __ } = useI18n();
	const [ isDismissed, setIsDismissed ] = useState( false );

	if ( isDismissed ) {
		return null;
	}

	const { status, message, transferDomain, dismissible } = notice;

	return (
		<div className={ `name-pulse-notice name-pulse-notice--${ status }` } role="status">
			<p className="name-pulse-notice__message">{ message }</p>
			{ transferDomain && onTransferClick && (
				<p className="name-pulse-notice__action">
					{ __( 'Already yours?' ) }{ ' ' }
					<Button variant="link" onClick={ () => onTransferClick( transferDomain ) }>
						{ __( 'Transfer it here.' ) }
					</Button>
				</p>
			) }
			{ dismissible && (
				<Button
					className="name-pulse-notice__dismiss"
					icon={ closeSmall }
					label={ __( 'Close' ) }
					size="small"
					onClick={ () => setIsDismissed( true ) }
				/>
			) }
		</div>
	);
};
