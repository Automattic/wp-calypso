/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import VerticalNav from 'calypso/components/vertical-nav';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import HeaderCake from 'calypso/components/header-cake';
import DomainManagementNavigationItem from 'calypso/my-sites/domains/domain-management/edit/navigation/domain-management-navigation-item';
import { getSelectedSite } from 'calypso/state/ui/selectors';

class AddUsingFlow extends React.Component {
	render() {
		const { translate, selectedSite } = this.props;
		return (
			<VerticalNav>
				<HeaderCake>How would you like to use your new domain?</HeaderCake>
				<DomainManagementNavigationItem
					path={ domainAddNew( 'something.wordpress.com' ) }
					materialIcon="language"
					text={ translate( 'Add new domain to {{strong}}%(siteTitle)s (%(siteSlug)s){{/strong}}', {
						components: {
							strong: <strong />,
						},
						args: {
							siteTitle: selectedSite.title,
							siteSlug: selectedSite.slug,
						},
					} ) }
					description={ translate( 'You get one year of free domain registration with your plan' ) }
				/>
				<DomainManagementNavigationItem
					path={ '/domains/add' }
					materialIcon="dns"
					text={ translate( 'Add new domain to {{strong}}one of your existing sites{{/strong}}', {
						components: {
							strong: <strong />,
						},
					} ) }
					description={ translate( 'Price depends on existing plan' ) }
				/>
				<DomainManagementNavigationItem
					path={ '/new' }
					gridicon="my-sites"
					text={ translate( 'Create {{strong}}new site{{/strong}} and add domain to it', {
						components: {
							strong: <strong />,
						},
					} ) }
					description={ translate(
						'You get one year free domain registration with all our plans'
					) }
				/>
				<DomainManagementNavigationItem
					path={ '/start/domain' }
					materialIcon="search"
					text={ translate(
						'Find and secure {{strong}}only domain name{{/strong}} and create a site later',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
					description={ translate(
						'You can register your domain name with us and decide what to do with it after'
					) }
				/>
			</VerticalNav>
		);
	}
}

export default connect( ( state ) => {
	return {
		selectedSite: getSelectedSite( state ),
	};
} )( localize( AddUsingFlow ) );
