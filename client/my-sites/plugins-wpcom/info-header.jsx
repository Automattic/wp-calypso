import React from 'react';

import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export const InfoHeader = React.createClass( {
	render() {
		return (
			<Notice
				status="is-info"
				showDismiss={ false }
				text={ "Your site comes pre-installed with a wide variety of plugins. Uploading your own plugins is not available on WordPress.com." }
			>
				<NoticeAction href="https://en.support.wordpress.com/plugins/" external={ true }>
					{ "Learn More" }
				</NoticeAction>
			</Notice>
		);
	}
} );

export default InfoHeader;
