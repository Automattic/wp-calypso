import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import DomainRow from './domain-row';
import DomainsTableHeader from './domains-table-header';
import ListItemPlaceholder from './item-placeholder';
import { filterOutWpcomDomains } from './utils';

const noop = () => {};

class DomainsTable extends PureComponent {
	static propTypes = {
		currentRoute: PropTypes.string,
		domains: PropTypes.array,
		domainsTableColumns: PropTypes.array,
		goToEditDomainRoot: PropTypes.func,
		handleUpdatePrimaryDomainOptionClick: PropTypes.func,
		isLoading: PropTypes.bool,
		isManagingAllSites: PropTypes.bool,
		primaryDomainIndex: PropTypes.number,
		purchases: PropTypes.array,
		settingPrimaryDomain: PropTypes.bool,
		shouldUpgradeToMakeDomainPrimary: PropTypes.func,
		sites: PropTypes.object,
		translate: PropTypes.func,
	};

	state = {
		sortKey: 'status', // initial column to sort by - should match the header columns
		sortOrder: -1, // initial sort order where 1 = ascending and -1 = descending
	};

	renderedQuerySiteDomains = {};
	renderedQuerySitePurchases = {};

	changeTableSort = ( selectedColumn, sortOrder = null ) => {
		const { domainsTableColumns } = this.props;

		const selectedColumnDefinition = domainsTableColumns.find(
			( column ) => column.name === selectedColumn
		);

		if ( ! selectedColumnDefinition?.isSortable ) {
			return;
		}

		this.setState( ( prevState ) => {
			let newSortOrder = sortOrder;

			if ( ! sortOrder ) {
				if ( selectedColumnDefinition?.supportsOrderSwitching ) {
					newSortOrder =
						selectedColumn === prevState.sortKey
							? prevState.sortOrder * -1
							: selectedColumnDefinition.initialSortOrder;
				} else {
					newSortOrder = selectedColumnDefinition.initialSortOrder;
				}
			}

			return {
				sortKey: selectedColumn,
				sortOrder: newSortOrder,
			};
		} );
	};

	renderQuerySitePurchasesOnce( blogId ) {
		if ( this.renderedQuerySitePurchases[ blogId ] ) {
			return null;
		}
		this.renderedQuerySitePurchases[ blogId ] = true;
		return <QuerySitePurchases key={ `query-purchases-${ blogId }` } siteId={ blogId } />;
	}

	renderQuerySiteDomainsOnce( blogId ) {
		if ( this.renderedQuerySiteDomains[ blogId ] ) {
			return null;
		}
		this.renderedQuerySiteDomains[ blogId ] = true;
		return <QuerySiteDomains key={ `query-purchases-${ blogId }` } siteId={ blogId } />;
	}

	render() {
		const {
			currentRoute,
			domains,
			domainsTableColumns,
			enableAllDomainsView,
			goToEditDomainRoot,
			handleUpdatePrimaryDomainOptionClick,
			isLoading,
			isManagingAllSites,
			primaryDomainIndex,
			purchases,
			settingPrimaryDomain,
			shouldUpgradeToMakeDomainPrimary,
			sites,
			translate,
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

		const selectedColumnDefinition = domainsTableColumns.find(
			( column ) => column.name === sortKey
		);

		if ( sortKey && sortOrder ) {
			domainItems.sort( ( first, second ) => {
				let result = 0;
				for ( const sortFunction of selectedColumnDefinition.sortFunctions ) {
					result = sortFunction( first, second, sortOrder );
					if ( 0 !== result ) {
						break;
					}
				}
				return result;
			} );
		}

		const domainListItems = domainItems.map( ( domain, index ) => {
			const purchase = purchases?.find( ( p ) => p.id === parseInt( domain.subscriptionId, 10 ) );
			const selectedSite = sites?.[ domain.blogId ];

			// TODO: how can we optimize the data loading? Can we load the daomin data using `InView` component as in list-all.jsx?
			return (
				<>
					{ ! enableAllDomainsView &&
						domain.blogId &&
						this.renderQuerySitePurchasesOnce( domain.blogId ) }
					{ enableAllDomainsView &&
						domain.blogId &&
						this.renderQuerySiteDomainsOnce( domain.blogId ) }
					<DomainRow
						key={ `${ domain.name }-${ index }` }
						currentRoute={ currentRoute }
						domain={ domain }
						site={ selectedSite }
						isManagingAllSites={ isManagingAllSites }
						onClick={ settingPrimaryDomain ? noop : goToEditDomainRoot }
						isBusy={ settingPrimaryDomain && index === primaryDomainIndex }
						busyMessage={ translate( 'Setting primary site address…', {
							context: 'Shows up when the primary domain is changing and the user is waiting',
						} ) }
						disabled={ settingPrimaryDomain }
						selectionIndex={ index }
						onMakePrimaryClick={ handleUpdatePrimaryDomainOptionClick }
						shouldUpgradeToMakePrimary={
							shouldUpgradeToMakeDomainPrimary && shouldUpgradeToMakeDomainPrimary( domain )
						}
						purchase={ purchase }
						enableAllDomainsView={ enableAllDomainsView }
					/>
				</>
			);
		} );

		return [
			domains.length > 0 && (
				<DomainsTableHeader
					key="domains-header"
					columns={ domainsTableColumns }
					isManagingAllSites={ isManagingAllSites }
					onChangeSortOrder={ this.changeTableSort }
					activeSortKey={ sortKey }
					activeSortOrder={ sortOrder }
					domainItemsCount={ domainItems.length }
				/>
			),
			...domainListItems,
		];
	}
}

export default localize( DomainsTable );
