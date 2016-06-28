/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

export const InfoHeader = React.createClass( {
	render() {
		const { translate } = this.props;
		return (
			<Notice
				status="is-info"
				showDismiss={ false }
				text={ translate( 'Your site comes pre-installed with a wide variety of plugins. Uploading your own plugins is not available on WordPress.com.' ) }
			>
				<NoticeAction href="https://en.support.wordpress.com/plugins/" external={ true }>
					{ translate( 'Learn More' ) }
				</NoticeAction>
			</Notice>
		);
	}
} );

export default localize( InfoHeader );
