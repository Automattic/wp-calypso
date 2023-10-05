import './help-center-survey.scss';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import wpcomProxyRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { Artwork } from './artwork';

// keep a session long state;
let hasSkipped = false;

export function Survey() {
	const [ skipped, setSkipped ] = useState( hasSkipped );
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery( {
		queryKey: [ 'me/preferences/help-center-survey' ],
		queryFn: () =>
			wpcomProxyRequest< {
				calypso_preferences: {
					'dismissed-help-center-survey': 'dismiss' | 'remind' | undefined;
				};
			} >( { path: '/me/preferences', apiVersion: '1.1' } ),
		enabled: canAccessWpcomApis(),
		staleTime: Infinity,
	} );

	const mutation = useMutation( {
		mutationFn: ( { type = 'dismiss' }: { type?: 'dismiss' | 'remind' | 'take' } ) => {
			recordTracksEvent( 'calypso_helpcenter_survey_interaction', {
				location: 'help-center',
				action: type,
			} );

			// We need to record both take and dismiss as dismiss in the preferences. We only need the nuance in the analytics.
			const action = [ 'take', 'dismiss' ].includes( type ) ? 'dismiss' : type;

			return wpcomProxyRequest( {
				path: '/me/preferences',
				apiVersion: '1.1',
				method: 'POST',
				body: {
					calypso_preferences: { 'dismissed-help-center-survey': action },
				},
			} );
		},
		onSuccess: ( data ) => {
			queryClient.setQueryData( [ 'me/preferences/help-center-survey' ], data );
		},
	} );

	const answeredBefore = data?.calypso_preferences[ 'dismissed-help-center-survey' ];

	const locale = useLocale();

	// The survey is only available in English.
	const englishLocale = locale?.startsWith( 'en' );

	// Only show in Simple sites and Calypso.
	if (
		! englishLocale ||
		skipped ||
		! canAccessWpcomApis() ||
		isLoading ||
		answeredBefore === 'dismiss'
	) {
		return null;
	}

	return (
		<div className="help-center__survey">
			<Artwork />
			<div className="help-center__survey-information">
				<h3 className="help-center__survey-title">
					{ __( 'Help us build a better Help Center?', __i18n_text_domain__ ) }
				</h3>
				<p className="help-center__survey-text">
					{ __(
						'What would your ideal Help Center look like? Take a few minutes to share your feedback and be part of its redesign.',
						__i18n_text_domain__
					) }
				</p>
			</div>
			<div className="help-center__survey-buttons">
				<Button
					onClick={ () => {
						window.open( 'https://wordpressdotcom.survey.fm/help-center-revamp' );
						mutation.mutate( { type: 'take' } );
					} }
					__next40pxDefaultSize
					variant="primary"
				>
					{ __( 'Take a quick survey', __i18n_text_domain__ ) }
				</Button>
				<Button
					onClick={ () => {
						setSkipped( true );
						hasSkipped = true;
						// If they haven't answered before, then we want to remind them later.
						// If they did, it means they clicked "I don't want to collaborate" and we want to dismiss it.
						if ( ! answeredBefore ) {
							mutation.mutate( { type: 'remind' } );
						} else {
							mutation.mutate( { type: 'dismiss' } );
						}
					} }
					variant="link"
				>
					{ answeredBefore === 'remind'
						? __( "I don't want to collaborate", __i18n_text_domain__ )
						: __( 'Remind me later', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}
