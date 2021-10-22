import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import DomainItem from './domain-item';
import DomainsTableHeader from './domains-table-header';
import ListItemPlaceholder from './item-placeholder';
import { filterOutWpcomDomains } from './utils';

const noop = () => {};

class DomainsTable extends PureComponent {
	static propTypes = {
		isLoading: PropTypes.bool,
		currentRoute: PropTypes.string,
		domains: PropTypes.array,
		selectedSite: PropTypes.object,
		settingPrimaryDomain: PropTypes.bool,
		primaryDomainIndex: PropTypes.number,
		translate: PropTypes.func,
		shouldUpgradeToMakeDomainPrimary: PropTypes.func,
		goToEditDomainRoot: PropTypes.func,
		handleUpdatePrimaryDomainOptionClick: PropTypes.func,
	};

	state = {
		sortKey: 'status', // column to sort by - should match the header columns
		sortOrder: 1, // sort order where 1 = ascending and -1 = descending
	};

	changeTableSort = ( column ) => {
		this.setState( ( prevState ) => {
			return {
				sortKey: column,
				sortOrder: column === prevState.sortKey ? prevState.sortOrder * -1 : 1,
			};
		} );
	};

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

		const { sortKey, sortOrder } = this.state;

		if ( isLoading ) {
			return [
				<ListItemPlaceholder key="item-1" />,
				<ListItemPlaceholder key="item-2" />,
				<ListItemPlaceholder key="item-3" />,
			];
		}

		const domainItems = filterOutWpcomDomains( domains );

		if ( sortKey && sortOrder ) {
			domainItems.sort( ( first, second ) => {
				const firstValue = first?.[ sortKey ];
				const secondValue = second?.[ sortKey ];

				if ( firstValue > secondValue ) {
					return sortOrder;
				}
				if ( firstValue < secondValue ) {
					return -1 * sortOrder;
				}
				return 0;
			} );
		}

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
				<DomainsTableHeader
					key="domains-header"
					isManagingAllSites={ false }
					onHeaderClick={ this.changeTableSort }
					activeSortKey={ sortKey }
					activeSortOrder={ sortOrder }
				/>
			),
			...domainListItems,
		];
	}
}

export default localize( DomainsTable );
