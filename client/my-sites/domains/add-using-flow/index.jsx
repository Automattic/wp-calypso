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
import { hasCustomDomain } from 'calypso/lib/site/utils';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { canCurrentUserManageSiteOptions, isJetpackSite } from 'calypso/state/sites/selectors';
import getSites from 'calypso/state/selectors/get-sites';

class AddUsingFlow extends React.Component {
	renderAddForSelectedSite() {
		const { translate, selectedSite, hasUnusedDomainCredit } = this.props;

		if ( ! selectedSite ) {
			return null;
		}

		let menuText;
		let menuDescription;

		if ( hasCustomDomain( selectedSite ) ) {
			menuText = translate(
				'Add another domain to point to {{strong}}%(siteTitle)s (%(siteSlug)s){{/strong}}',
				{
					components: {
						strong: <strong />,
					},
					args: {
						siteTitle: selectedSite.title,
						siteSlug: selectedSite.slug,
					},
				}
			);
		} else {
			menuText = translate( 'Add domain to {{strong}}%(siteTitle)s (%(siteSlug)s){{/strong}}', {
				components: {
					strong: <strong />,
				},
				args: {
					siteTitle: selectedSite.title,
					siteSlug: selectedSite.slug,
				},
			} );
		}

		if ( hasUnusedDomainCredit ) {
			menuDescription = translate(
				'You have one year of free domain registration with your active plan'
			);
		} else if ( siteHasPaidPlan( selectedSite ) ) {
			menuDescription = translate( 'Get additional domain pointed at your site starting from $25' );
		} else {
			menuDescription = translate(
				'Get one year domain registration for free with any of our plans'
			);
		}

		return (
			<DomainManagementNavigationItem
				path={ domainAddNew( selectedSite.slug ) }
				materialIcon="language"
				text={ menuText }
				description={ menuDescription }
			/>
		);
	}

	render() {
		const { translate, userManagedSites } = this.props;
		return (
			<VerticalNav>
				<HeaderCake>{ translate( 'How would you like to use your new domain?' ) }</HeaderCake>
				{ this.renderAddForSelectedSite() }
				{ userManagedSites.length > 1 && (
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
				) }
				<DomainManagementNavigationItem
					path={ '/new' }
					gridicon="my-sites"
					text={ translate( 'Create {{strong}}new site{{/strong}} and add domain to it', {
						components: {
							strong: <strong />,
						},
					} ) }
					description={ translate(
						'You get one year free domain registration with our paid plans'
					) }
				/>
				<DomainManagementNavigationItem
					path={ '/start/domain' }
					materialIcon="search"
					text={ translate(
						'Find and secure {{strong}}just the domain name{{/strong}} and create your site later',
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

const filterManagedSites = ( state ) => ( site ) =>
	! isJetpackSite( state, site.ID ) && canCurrentUserManageSiteOptions( state, site.ID );

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	const allSites = getSites( state );
	const userManagedSites = allSites.filter( filterManagedSites( state ) );
	return {
		selectedSite,
		hasUnusedDomainCredit: hasDomainCredit( state, selectedSite?.ID ),
		userManagedSites,
	};
} )( localize( AddUsingFlow ) );
