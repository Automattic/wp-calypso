import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext } from 'react';
import { getSelectedFilters } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/get-selected-filters';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_DOWNTIME_MONITORING_DURATION } from '../constants';
import SitesOverviewContext from '../sites-overview/context';
import getRejectedAndFulfilledRequests from './get-rejected-and-fulfilled-requests-util';
import type { Site, UpdateMonitorSettingsParams } from '../sites-overview/types';

const NOTIFICATION_DURATION = 3000;

export default function useUpdateMonitorSettings(
	sites: Array< Site >,
	checkInterval: number = DEFAULT_DOWNTIME_MONITORING_DURATION
): {
	updateMonitorSettings: ( params: UpdateMonitorSettingsParams ) => void;
	isLoading: boolean;
	isComplete: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );

	const { dataViewsState, showOnlyFavorites, showOnlyDevelopmentSites } =
		useContext( SitesDashboardContext );

	const agencyId = useSelector( getActiveAgencyId );

	const queryKey = isA8CForAgencies()
		? [
				'jetpack-agency-dashboard-sites',
				dataViewsState.search,
				dataViewsState.page,
				{
					issueTypes: getSelectedFilters( dataViewsState.filters ),
					showOnlyFavorites: showOnlyFavorites || false,
					showOnlyDevelopmentSites: showOnlyDevelopmentSites || false,
				},
				dataViewsState.sort,
				dataViewsState.perPage,
				...( agencyId ? [ agencyId ] : [] ),
		  ]
		: [
				'jetpack-agency-dashboard-sites',
				search,
				currentPage,
				filter,
				sort,
				...( agencyId ? [ agencyId ] : [] ),
		  ];

	const [ status, setStatus ] = useState( 'idle' );

	const updateMonitorSettings = useUpdateMonitorSettingsMutation( {
		onSuccess: async ( data, { siteId } ) => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( {
				queryKey,
			} );

			// Optimistically update to the new value
			queryClient.setQueryData( queryKey, ( oldSites: any ) => {
				return {
					...oldSites,
					sites: oldSites?.sites.map( ( site: Site ) => {
						if ( site.blog_id === siteId ) {
							return {
								...site,
								monitor_settings: {
									...site.monitor_settings,
									monitor_user_email_notifications: data.settings.email_notifications,
									monitor_user_sms_notifications: data.settings.sms_notifications,
									monitor_user_wp_note_notifications: data.settings.wp_note_notifications,
									monitor_notify_additional_user_emails: data.settings.contacts?.emails ?? [],
									monitor_notify_additional_user_sms: data.settings.contacts?.sms_numbers ?? [],
									check_interval: data.settings.urls?.[ 0 ].check_interval,
								},
							};
						}
						return site;
					} ),
				};
			} );
		},
	} );

	const getUpdatedParams = useCallback(
		( { blog_id: siteId, url_with_scheme }: Site, params: UpdateMonitorSettingsParams ) => {
			const updatedParams = {
				...params,
				urls: [
					{
						check_interval: checkInterval,
						options: [],
						monitor_url: url_with_scheme,
					},
				],
			};
			return { siteId, params: updatedParams };
		},
		[ checkInterval ]
	);

	const update = useCallback(
		async ( params: UpdateMonitorSettingsParams ) => {
			setStatus( 'loading' );

			const requests: any = [];
			sites.forEach( ( site ) =>
				requests.push( {
					site,
					mutation: updateMonitorSettings.mutateAsync( getUpdatedParams( site, params ) ),
				} )
			);
			const promises = await Promise.allSettled(
				requests.map( ( request: { mutation: any } ) => request.mutation )
			);

			setStatus( 'completed' );

			const components = {
				em: <em />,
			};

			const { fulfilledRequests, rejectedRequests } = getRejectedAndFulfilledRequests(
				promises,
				requests
			);

			const totalFulfilled = fulfilledRequests.length;
			const totalRejected = rejectedRequests.length;

			if ( totalFulfilled ) {
				let successMessage;
				if ( totalFulfilled > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalFulfilled },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					successMessage = translate(
						'Successfully updated the monitor settings for %(siteCountText)s.',
						{
							args: { siteCountText },
							comment: '%(siteCountText) is no of sites, e.g. "2 sites"',
							components,
						}
					);
				} else {
					const siteUrl = fulfilledRequests[ 0 ].site.url;
					successMessage = translate(
						'Successfully updated the monitor settings for {{em}}%(siteUrl)s{{/em}}.',
						{
							args: { siteUrl },

							components,
						}
					);
				}
				dispatch( successNotice( successMessage, { duration: NOTIFICATION_DURATION } ) );
			}

			if ( totalRejected ) {
				let errorMessage;
				if ( totalRejected > 1 ) {
					const siteCountText = translate( '%(siteCount)d sites', {
						args: { siteCount: totalRejected },
						comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					} );
					errorMessage = translate(
						'Sorry, something went wrong when trying to update monitor settings for %(siteCountText)s. Please try again.',
						{
							args: { siteCountText },
							comment: '%(siteCountText) is no of sites, e.g. "2 sites"',
							components,
						}
					);
				} else {
					const siteUrl = rejectedRequests[ 0 ].site.url;
					errorMessage = translate(
						'Sorry, something went wrong when trying to update monitor settings for {{em}}%(siteUrl)s{{/em}}. Please try again.',
						{
							args: { siteUrl },
							components,
						}
					);
				}
				dispatch( errorNotice( errorMessage, { duration: NOTIFICATION_DURATION } ) );
			}
		},
		[ dispatch, getUpdatedParams, sites, translate, updateMonitorSettings ]
	);

	return {
		updateMonitorSettings: update,
		isLoading: status === 'loading',
		isComplete: status === 'completed',
	};
}
