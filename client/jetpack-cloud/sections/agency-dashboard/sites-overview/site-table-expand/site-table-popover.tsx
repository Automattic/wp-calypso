import { Button, Popover } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { forwardRef } from 'react';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';

import './style.scss';

// @todo: We could make the component more generic by passing the header, body and footer as props.
const SiteTablePopover = (
	{ savePreferenceType }: { savePreferenceType: () => void },
	ref: any
) => {
	const translate = useTranslate();

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, true );

	const handlePopoverDismiss = () => {
		savePreferenceType();
		recordEvent( 'expandable_block_popover_dismiss_click' );
	};

	const content = (
		<div className="site-table__expand-popover-content">
			<div className="site-table__expand-popover-header">{ translate( 'See more info' ) }</div>
			<div className="site-table__expand-popover-body">
				{ translate( 'Click here for more info about your site.' ) }
			</div>
			<div className="site-table__expand-popover-footer">
				<Button onClick={ handlePopoverDismiss } compact>
					{ translate( 'Got it' ) }
				</Button>
			</div>
		</div>
	);

	return (
		<Popover id="site-table-expand-popover" isVisible position="bottom" context={ ref.current }>
			{ content }
		</Popover>
	);
};

export default forwardRef( SiteTablePopover );
