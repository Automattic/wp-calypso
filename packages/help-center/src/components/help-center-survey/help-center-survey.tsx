import './help-center-survey.scss';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import wpcomProxyRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import artwork from './artwork.png';

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
					'dismissed-help-center-survey': boolean;
				};
			} >( { path: '/me/preferences', apiVersion: '1.1' } ),
		enabled: ! skipped && canAccessWpcomApis(),
		staleTime: Infinity,
	} );

	const mutation = useMutation( {
		mutationFn: () =>
			wpcomProxyRequest( {
				path: '/me/preferences',
				apiVersion: '1.1',
				method: 'POST',
				body: {
					calypso_preferences: { 'dismissed-help-center-survey': true },
				},
			} ),
		onSuccess: () => {
			queryClient.setQueryData( [ 'me/preferences/help-center-survey' ], {
				calypso_preferences: {
					'dismissed-help-center-survey': true,
				},
			} );
		},
	} );

	const answeredBefore = data?.calypso_preferences[ 'dismissed-help-center-survey' ];

	// Only show in Simple sites and Calypso.
	if ( skipped || ! canAccessWpcomApis() || isLoading || answeredBefore ) {
		return null;
	}

	return (
		<div className="help-center__survey">
			<img src={ artwork } alt="" className="help-center__survey-artwork" role="presentation" />
			<h3 className="help-center__survey-title">
				{ __( 'Help us build a better Help Center?', __i18n_text_domain__ ) }
			</h3>
			<p className="help-center__survey-text">
				{ __(
					'What would your ideal Help Center look like? Take a few minutes to share your feedback and be part of its redesign.',
					__i18n_text_domain__
				) }
			</p>
			<div className="help-center__survey-buttons">
				<Button
					onClick={ () => {
						window.open( 'https://wordpressdotcom.survey.fm/help-center-revamp' );
						mutation.mutate();
					} }
					variant="primary"
				>
					{ __( 'Take a quick survey', __i18n_text_domain__ ) }
				</Button>
				<Button
					onClick={ () => {
						setSkipped( true );
						hasSkipped = true;
					} }
					variant="link"
				>
					{ __( 'Remind me later', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
}
