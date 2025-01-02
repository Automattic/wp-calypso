import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { BulkUpdateNotice } from './components/bulk-update-notice';
import { DomainData } from './types';
import { useActions } from './use-actions';
import { useDomainsDataViewsContext } from './use-context';
import { getDomainId } from './use-domains';
import './style.scss';
import { useFields } from './use-fields';
import useView, { getFieldsByBreakpoint } from './use-view';

type Props = {
	domains: DomainData[];
	isLoading: boolean;
	sidebarMode?: boolean;
	selectedDomainName?: string;
	openDomainPane?: ( domain: DomainData ) => void;
};

export const DomainsDataViews = ( {
	domains,
	isLoading,
	sidebarMode,
	selectedDomainName,
	openDomainPane,
}: Props ) => {
	const { __ } = useI18n();
	const { isDesktop } = useDomainsDataViewsContext();

	const { view, setView } = useView( { sidebarMode, isDesktop } );
	const fields = useFields( { openDomainPane } );
	const actions = useActions( { sidebarMode } );

	const { data: processedDomains, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( domains, view, fields );
	}, [ domains, view, fields ] );

	const [ selectedIds, setSelectedIds ] = useState< string[] >( [] );
	const selectedDomain = domains
		.filter( ( d: DomainData ) => d.processed.domain === selectedDomainName )
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

	const layout = sidebarMode ? { list: {} } : { table: {} };
	return (
		<div className={ clsx( 'domains-dataviews', { 'domains-dataviews-list': sidebarMode } ) }>
			{ ! sidebarMode && <BulkUpdateNotice /> }
			<DataViews
				data={ processedDomains }
				fields={ fields }
				onChangeView={ ( newView ) => setView( () => newView ) }
				view={ view }
				actions={ actions }
				search
				searchLabel={ __( 'Search by domain…' ) }
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
