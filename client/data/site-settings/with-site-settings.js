import { useQueryClient } from '@tanstack/react-query';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useCallback, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import useSiteSettingsQuery from 'calypso/data/site-settings/use-site-settings-query';
import useUpdateSiteSettingsMutation from 'calypso/data/site-settings/use-update-site-settings-mutation';
import { useProtectForm } from 'calypso/lib/protect-form';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';

const noticeOptions = {
	duration: 10000,
	id: 'site-settings-save',
};

const withSiteSettings = createHigherOrderComponent( ( Wrapped ) => {
	const WithSiteSettings = ( props ) => {
		const { siteId } = props;
		const [ unsavedSettings, setUnsavedSettings ] = useState( {} );
		const dispatch = useDispatch();
		const translate = useTranslate();
		const queryClient = useQueryClient();
		const path = useSelector( ( state ) => getCurrentRouteParameterized( state, siteId ) );
		const { markChanged, markSaved } = useProtectForm();

		const trackEvent = useCallback(
			( name ) => {
				dispatch( recordGoogleEvent( 'Site Settings', name ) );
			},
			[ dispatch ]
		);

		const trackTracksEvent = useCallback(
			( name, eventProps ) => {
				dispatch( recordTracksEvent( name, eventProps ) );
			},
			[ dispatch ]
		);

		const { data, isLoading: isFetchingSettings } = useSiteSettingsQuery( siteId );

		const updateSettings = useCallback(
			( fields ) => {
				markChanged();
				return setUnsavedSettings( { ...unsavedSettings, ...fields } );
			},
			[ markChanged, unsavedSettings, setUnsavedSettings ]
		);

		const {
			isPending: isSavingSettings,
			updateSiteSettings: saveSettings,
			context: mutateContext,
		} = useUpdateSiteSettingsMutation( siteId, {
			onMutate: async ( settings ) => {
				const queryKey = [ 'site-settings', siteId ];

				// Cancel any current refetches, so they don't overwrite our optimistic update
				await queryClient.cancelQueries( {
					queryKey,
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
				setUnsavedSettings( {} ); // clear dirty fields after successful save.
				if ( path === '/settings/newsletter/:site' ) {
					trackTracksEvent( 'calypso_settings_newsletter_saved', unsavedSettings );
				}
				markSaved();
			},
			onError( err, newSettings, context ) {
				// Revert to previous settings on failure
				queryClient.setQueryData( [ 'site-settings', siteId ], context.previousSettings );

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
					queryKey: [ 'site-settings', siteId ],
				} );
			},
		} );

		const handleSubmitForm = useCallback( () => {
			trackEvent( 'Clicked Save Settings Button' );
			saveSettings( unsavedSettings );
			if ( ! unsavedSettings ) {
				return;
			}
			trackEvent( 'Clicked Save Settings Button' );
		}, [ saveSettings, unsavedSettings, trackEvent ] );

		const handleToggle = useCallback(
			( name ) => () => {
				if ( unsavedSettings[ name ] === undefined ) {
					unsavedSettings[ name ] = data?.settings[ name ];
				}
				updateSettings( { [ name ]: ! unsavedSettings[ name ] } );
				trackEvent( `Toggled ${ name }` );
			},
			[ trackEvent, unsavedSettings, updateSettings, data?.settings ]
		);

		const settings = Object.assign(
			{},
			mutateContext?.previousSettings?.settings,
			data?.settings,
			unsavedSettings
		);
		return (
			<Wrapped
				{ ...props }
				settings={ settings }
				isLoadingSettings={ isFetchingSettings }
				isSavingSettings={ isSavingSettings }
				updateSettings={ updateSettings }
				unsavedSettings={ unsavedSettings }
				handleToggle={ handleToggle }
				handleSubmitForm={ handleSubmitForm }
			/>
		);
	};

	WithSiteSettings.propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	return WithSiteSettings;
}, 'WithSiteSettings' );

export default withSiteSettings;
