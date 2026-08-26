import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Modal } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import { useAppContext } from '../../app/context';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { siteRoute, siteDomainsRoute, siteSettingsRedirectRoute } from '../../app/router/sites';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PendingPrimaryDomainNotice from '../../components/pending-primary-domain-notice';
import AddDomainButton from '../../domains/add-domain-button';
import {
	useActions,
	useFields,
	DEFAULT_LAYOUTS,
	SITE_CONTEXT_VIEW,
	useBulkActionsProgressNotice,
} from '../../domains/dataviews';
import { isPendingPrimaryDomain } from '../../utils/domain';
import { SitesNoticeArbiter } from '../notice-arbiter';
import PrimaryDomainSelectorNotice from './primary-domain-selector-notice';
import type { DomainSummary } from '@automattic/api-core';
import type { ActionModal } from '@wordpress/dataviews';

function getDomainId( domain: DomainSummary ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

/**
 * Renders an action's modal outside the row menu, matching the chrome DataViews
 * would have given it, so a deep link opens the same thing a click does.
 */
function DeepLinkedActionModal( {
	action,
	item,
	onClose,
}: {
	action: ActionModal< DomainSummary >;
	item: DomainSummary;
	onClose: () => void;
} ) {
	const label = typeof action.label === 'function' ? action.label( [ item ] ) : action.label;
	const modalHeader =
		typeof action.modalHeader === 'function' ? action.modalHeader( [ item ] ) : action.modalHeader;

	return (
		<Modal
			title={ modalHeader || label }
			size={ action.modalSize ?? 'medium' }
			onRequestClose={ onClose }
		>
			<action.RenderModal items={ [ item ] } closeModal={ onClose } />
		</Modal>
	);
}

function SiteDomains() {
	const queryClient = useQueryClient();
	const { queries } = useAppContext();
	const { siteSlug } = siteRoute.useParams();
	const { user } = useAuth();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteDomains } = useSuspenseQuery( {
		...queries.domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
		},
	} );

	const pendingDomain = siteDomains.find( isPendingPrimaryDomain );

	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );
	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const bulkActionsNotice = useBulkActionsProgressNotice();

	const fields = useFields( {
		site,
	} );

	const actions = useActions( { user, sites: [ site ] } );

	const searchParams = siteDomainsRoute.useSearch();
	const navigate = useNavigate();

	// The action is read once, so the modal survives the param being cleared below.
	const [ deepLinkedActionId ] = useState( () => searchParams.action );
	const matchedAction = actions.find( ( action ) => action.id === deepLinkedActionId );
	const deepLinkedAction =
		matchedAction && 'RenderModal' in matchedAction ? matchedAction : undefined;
	const deepLinkedDomain = siteDomains.find(
		( domain ) => deepLinkedAction?.isEligible?.( domain )
	);
	const [ isDeepLinkedActionOpen, setIsDeepLinkedActionOpen ] = useState(
		() => !! searchParams.action
	);

	useEffect( () => {
		if ( ! searchParams.action ) {
			return;
		}

		// Drop the param so a reload or a shared URL doesn't reopen the modal.
		navigate( {
			to: siteDomainsRoute.fullPath,
			params: { siteSlug },
			search: ( previous: Record< string, unknown > ) => ( { ...previous, action: undefined } ),
			replace: true,
		} );
	}, [ searchParams.action, navigate, siteSlug ] );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-domains',
		defaultView: SITE_CONTEXT_VIEW,
		queryParams: searchParams,
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( siteDomains, view, fields );

	// Hide actions column when no domain has eligible actions.
	const hasEligibleActions = siteDomains.some( ( item ) =>
		actions.some( ( action ) => action.isEligible === undefined || action.isEligible( item ) )
	);

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'Domains' ) } actions={ <AddDomainButton /> } /> }
			notices={
				<>
					{ /* Action feedback, not an on-load banner: rendered outside the arbiter. */ }
					{ bulkActionsNotice }
					<SitesNoticeArbiter>
						{ ! hasRedirect && pendingDomain && (
							<PendingPrimaryDomainNotice
								domainName={ pendingDomain.domain }
								onComplete={ () => queryClient.invalidateQueries( queries.domainsQuery() ) }
							/>
						) }
						{ ! hasRedirect && ! pendingDomain && (
							<PrimaryDomainSelectorNotice domains={ siteDomains } site={ site } user={ user } />
						) }
						{ hasRedirect && (
							<Notice variant="warning">
								{ createInterpolateElement(
									__(
										'This site <site/> and all domains attached to it will redirect to <redirect/>. If you want to change that <link>click here</link>.'
									),
									{
										site: <b>{ site.slug }</b>,
										redirect: <b>{ redirect.location }</b>,
										link: (
											<Link
												to={ siteSettingsRedirectRoute.fullPath }
												params={ { siteSlug: site.slug } }
											/>
										),
									}
								) }
							</Notice>
						) }
					</SitesNoticeArbiter>
				</>
			}
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ updateView }
					onReset={ resetView }
					view={ view }
					actions={ hasEligibleActions ? actions : [] }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
			{ isDeepLinkedActionOpen && deepLinkedAction && deepLinkedDomain && (
				<DeepLinkedActionModal
					action={ deepLinkedAction }
					item={ deepLinkedDomain }
					onClose={ () => setIsDeepLinkedActionOpen( false ) }
				/>
			) }
			<PerformanceTrackerStop />
		</PageLayout>
	);
}

export default SiteDomains;
