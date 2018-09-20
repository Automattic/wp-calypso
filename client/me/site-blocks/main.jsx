/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

class SiteBlockList extends Component {
	render() {
		const { translate, isLoading } = this.props;
		const containerClasses = classnames( 'site-block-list', 'main', {
			'is-loading': isLoading,
		} );

		return (
			<Main className={ containerClasses }>
				<PageViewTracker path="/me/site-blocks" title="Me > Blocked Sites" />
				<DocumentHead title={ translate( 'Blocked Sites' ) } />
				<MeSidebarNavigation />
				<SectionHeader label={ translate( 'Blocked Sites' ) } />
				<Card className="site-blocks__intro">
					<p>
						{ translate(
							'Blocked sites will not appear in your Reader and will not be recommended to you.'
						) }
					</p>
				</Card>
			</Main>
		);
	}
}

export default localize( SiteBlockList );
