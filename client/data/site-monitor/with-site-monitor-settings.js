import { useQueryClient } from '@tanstack/react-query';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import useSiteMonitorSettingsQuery from 'calypso/data/site-monitor/use-site-monitor-settings-query';
import useUpdateSiteMonitorSettingsMutation from 'calypso/data/site-monitor/use-update-site-monitor-settings-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const noticeOptions = {
	duration: 5000,
	id: `site-monitor-settings-update-notification`,
};

const withSiteMonitorSettings = createHigherOrderComponent( ( Wrapped ) => {
	const WithSiteMonitorSettings = ( props ) => {
		const { siteId } = props;
		const dispatch = useDispatch();
		const translate = useTranslate();
		const queryClient = useQueryClient();
		const { data, isLoading: isFetchingSettings } = useSiteMonitorSettingsQuery( siteId );
		const { isLoading: isUpdatingSettings, updateSiteMonitorSettings } =
			useUpdateSiteMonitorSettingsMutation( siteId, {
				onMutate: async ( settings ) => {
					const queryKey = [ 'site-monitor-settings', siteId ];

					// Cancel any current refetches, so they don't overwrite our optimistic update
					await queryClient.cancelQueries( {
						queryKey: queryKey,
					} );

					// Snapshot the previous value
					const previousSettings = queryClient.getQueryData( queryKey );

					// Optimistically update to the new value
					queryClient.setQueryData( queryKey, ( { settings: oldSettings } ) => {
						return { ...oldSettings, ...settings };
					} );

					// Store previous settings in case of failure
					return { previousSettings };
				},
				onSuccess() {
					dispatch( successNotice( translate( 'Settings saved successfully!' ), noticeOptions ) );
				},
				onError( err, newSettings, context ) {
					// Revert to previous settings on failure
					queryClient.setQueryData( [ 'site-monitor-settings', siteId ], context.previousSettings );

					dispatch(
						errorNotice(
							translate( 'There was a problem saving your changes. Please, try again.' ),
							noticeOptions
						)
					);
				},
				onSettled: () => {
					// Refetch settings regardless
					queryClient.invalidateQueries( {
						queryKey: [ 'site-monitor-settings', siteId ],
					} );
				},
			} );

		return (
			<Wrapped
				{ ...props }
				siteMonitorSettings={ data?.settings }
				isLoadingSiteMonitorSettings={ isFetchingSettings }
				isUpdatingSiteMonitorSettings={ isUpdatingSettings }
				updateSiteMonitorSettings={ updateSiteMonitorSettings }
			/>
		);
	};

	WithSiteMonitorSettings.propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	return WithSiteMonitorSettings;
}, 'WithSiteMonitorSettings' );

export default withSiteMonitorSettings;
