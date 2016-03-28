import React from 'react';

import Card from 'components/card';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export const InfoHeader = React.createClass( {
	render() {
		return (
			<Notice
				showDismiss={ false }
				text={ "Uploading and installing your own plugins is not available on WordPress.com, but we offer the most essential ones below." }>
				<NoticeAction href="https://en.support.wordpress.com/plugins/">
					{ "Learn More" }
				</NoticeAction> 
			</Notice>
		);
	}
} );

export default InfoHeader;
