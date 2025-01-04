import { PartialDomainData } from '@automattic/data-stores';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { navigate } from 'calypso/lib/navigate';
import { BulkUpdateNotice } from './components/bulk-update-notice';
import { useActions } from './use-actions';
import { useDomainsDataViewsContext } from './use-context';
import { getDomainId } from './use-domains';
import './style.scss';
import { useFields } from './use-fields';
import useQueryParams, { DEFAULT_PER_PAGE, buildPathWithQueryParams } from './use-query-params';
import useView, { getFieldsByBreakpoint, useInitializeDataViewsPage } from './use-view';

type Props = {
	domains: PartialDomainData[] | undefined;
	isLoading: boolean;
	sidebarMode?: boolean;
	selectedDomainName?: string;
	openDomainPane?: ( domain: PartialDomainData ) => void;
};

export const DomainsDataViews = ( {
	domains,
	isLoading,
	sidebarMode,
	selectedDomainName,
	openDomainPane,
}: Props ) => {
	const translate = useTranslate();
	const { isDesktop } = useDomainsDataViewsContext();
	const queryParams = useQueryParams();

	const { view, setView } = useView( { sidebarMode, isDesktop, queryParams } );
	const fields = useFields( { openDomainPane } );
	const actions = useActions( { sidebarMode } );
	const { data: domainsToDisplay, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( domains || [], view, fields );
	}, [ domains, view, fields ] );

	const [ selectedIds, setSelectedIds ] = useState< string[] >( [] );
	const selectedDomain = domainsToDisplay
		.filter( ( d: PartialDomainData ) => d.domain === selectedDomainName )
		.pop();

	useEffect( () => {
		const fieldsForBreakpoint = getFieldsByBreakpoint( isDesktop, sidebarMode );
		const sortedFieldsForBreakpoint = [ ...fieldsForBreakpoint ].sort().toString();
		const sortedExistingFields = [ ...( view?.fields ?? [] ) ].sort().toString();
		// Compare the content of the arrays, not its referrences that will always be different.
		// sort() sorts the array in place, so we need to clone them first.
		if ( sortedExistingFields !== sortedFieldsForBreakpoint ) {
			setView( ( prevState ) => ( { ...prevState, fields: fieldsForBreakpoint } ) );
		}
	}, [ isDesktop, sidebarMode, view, setView ] );

	useInitializeDataViewsPage( view, setView );

	// Update URL with view control params on change.
	useEffect( () => {
		const queryParams = {
			search: view.search?.trim(),
			page: view.page && view.page > 1 ? view.page : undefined,
			perPage: view.perPage === DEFAULT_PER_PAGE ? undefined : view.perPage,
		};

		window.setTimeout( () => {
			const url = buildPathWithQueryParams( queryParams );
			navigate( url, false, false );
		} );
	}, [ view.search, view.page, view.perPage ] );

	const layout = sidebarMode ? { list: {} } : { table: {} };
	return (
		<div className={ clsx( 'domains-dataviews', { 'domains-dataviews-list': sidebarMode } ) }>
			{ ! sidebarMode && <BulkUpdateNotice /> }
			<DataViews
				data={ domainsToDisplay }
				fields={ fields }
				onChangeView={ ( newView ) => setView( () => newView ) }
				view={ view }
				actions={ actions }
				search
				searchLabel={ translate( 'Search by domain…' ) }
				paginationInfo={ paginationInfo }
				getItemId={ getDomainId }
				selection={ selectedDomain ? [ getDomainId( selectedDomain ) ] : selectedIds }
				onChangeSelection={ setSelectedIds }
				isLoading={ isLoading }
				defaultLayouts={ layout }
			/>
		</div>
	);
};
