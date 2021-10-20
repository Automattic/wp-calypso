import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import DomainItem from './domain-item';
import DomainsTableHeader from './domains-table-header';
import ListItemPlaceholder from './item-placeholder';
import { filterOutWpcomDomains } from './utils';

const noop = () => {};

// TODO: keep sorting key as local state to this component?
class DomainsTable extends PureComponent {
	render() {
		const {
			isLoading,
			currentRoute,
			domains,
			selectedSite,
			settingPrimaryDomain,
			primaryDomainIndex,
			translate,
			shouldUpgradeToMakeDomainPrimary,
			goToEditDomainRoot,
			handleUpdatePrimaryDomainOptionClick,
		} = this.props;

		if ( isLoading ) {
			return [
				<ListItemPlaceholder key="item-1" />,
				<ListItemPlaceholder key="item-2" />,
				<ListItemPlaceholder key="item-3" />,
			];
		}

		const domainItems = filterOutWpcomDomains( domains );

		const domainListItems = domainItems.map( ( domain, index ) => (
			<DomainItem
				key={ `${ domain.name }-${ index }` }
				currentRoute={ currentRoute }
				domain={ domain }
				domainDetails={ domain }
				site={ selectedSite }
				isManagingAllSites={ false }
				onClick={ settingPrimaryDomain ? noop : goToEditDomainRoot }
				isBusy={ settingPrimaryDomain && index === primaryDomainIndex }
				busyMessage={ translate( 'Setting Primary Domain…', {
					context: 'Shows up when the primary domain is changing and the user is waiting',
				} ) }
				disabled={ settingPrimaryDomain }
				selectionIndex={ index }
				onMakePrimaryClick={ handleUpdatePrimaryDomainOptionClick }
				shouldUpgradeToMakePrimary={ shouldUpgradeToMakeDomainPrimary( domain ) }
			/>
		) );

		return [
			<QuerySitePurchases key="query-purchases" siteId={ selectedSite.ID } />,
			domains.length > 0 && (
				<DomainsTableHeader key="domains-header" isManagingAllSites={ false } />
			),
			...domainListItems,
		];
	}
}

export default localize( DomainsTable );
