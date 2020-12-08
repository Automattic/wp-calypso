/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

export default class extends React.Component {
	static displayName = 'NotificationsBlogSettingsPlaceholder';

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<CompactCard className="notification-settings-blog-settings-placeholder">
				<header className="notification-settings-blog-settings-placeholder__header">
					<div className="notification-settings-blog-settings-placeholder__blog">
						<div className="notification-settings-blog-settings-placeholder__blog__content">
							<div className="notification-settings-blog-settings-placeholder__blog__content__icon">
								<Gridicon
									// eslint-disable-next-line wpcalypso/jsx-classname-namespace
									className="notification-settings-blog-settings-placeholder__blog__content__icon__gridicon"
									icon="site"
								/>
							</div>
							<div className="notification-settings-blog-settings-placeholder__blog__info">
								<div className="notification-settings-blog-settings-placeholder__blog__info__title">
									&nbsp;
								</div>
								<div className="notification-settings-blog-settings-placeholder__blog__info__domain">
									&nbsp;
								</div>
							</div>
						</div>
					</div>
					<div className="notification-settings-blog-settings-placeholder__legend">
						<em>&nbsp;</em>
					</div>
				</header>
			</CompactCard>
		);
	}
}
