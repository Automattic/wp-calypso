import React from 'react';
import Notice from 'calypso/components/notice';

const TrialUpsellNotice = ( { text } ) => {
	return (
		<Notice
			className="site-settings__trial-upsell-notice"
			icon="info"
			showDismiss={ false }
			text={ text }
			isCompact={ false }
			status="is-warning"
		/>
	);
};

export default TrialUpsellNotice;
