/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */

import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { translate } from 'i18n-calypso';
import { Card, Button } from '@automattic/components';
import Main from 'calypso/components/main';

class StoreRemovedNoticeView extends Component {
	render = () => {
		return (
			<Main className={ 'dashboard' } wideLayout>
				<div className="dashboard__store-removed">
					<Notice status="is-error" icon="notice" translate={ translate } showDismiss={ false }>
						Store has moved to WooCommerce
						<NoticeAction href="#">{ 'More' }</NoticeAction>
					</Notice>
					<Card>
						<h1>Store has moved to WooCommerce</h1>
						<p>Now you'll be able to access all of your most important</p>
						<p>store management features in one place.</p>
						<Button primary>{ translate( 'Go to WooCommerce Home' ) }</Button>
					</Card>
				</div>
			</Main>
		);
	};
}

export default StoreRemovedNoticeView;
