import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DomainActionsButton from 'calypso/my-sites/domains/domain-management/list-new/domain-actions-button';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';

import './style.scss';

class ListNew extends Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
		hasSingleSite: PropTypes.bool,
	};

	renderBreadcrumbs() {
		const { translate } = this.props;

		const item = {
			label: 'Domains',
			helpBubble: translate(
				'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
		};
		const buttons = [
			<DomainActionsButton key="breadcrumb_button_1" specificSiteActions />,
			<DomainActionsButton key="breadcrumb_button_2" ellipsisButton />,
		];

		return (
			<Breadcrumbs
				items={ [ item ] }
				mobileItem={ item }
				buttons={ buttons }
				mobileButtons={ buttons }
			/>
		);
	}

	render() {
		return (
			<Main fullWidthLayout>
				{ this.renderBreadcrumbs() }
				<SidebarNavigation />
			</Main>
		);
	}
}

export default connect(
	() => ( {} ),
	() => ( {} )
)( localize( ListNew ) );
