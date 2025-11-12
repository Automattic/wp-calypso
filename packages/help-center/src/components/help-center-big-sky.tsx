import { useAgentChat } from '@automattic/agenttic-client';
import { AgentUI, EmptyView } from '@automattic/agenttic-ui';
import { BigSkyLogo } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import wpcomRequest from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import './help-center-big-sky.scss';

const suggestions = [
	{
		id: 'view-recent-orders',
		label: __( 'View recent orders' ),
		prompt: __( 'Show me my recent orders' ),
	},
	{
		id: 'check-inventory',
		label: __( 'Check product inventory' ),
		prompt: __( 'Show me products that are low in stock' ),
	},
	{
		id: 'create-product',
		label: __( 'Create a product' ),
		prompt: __( 'Help me create a new product for' ),
	},
	{
		id: 'review-analytics',
		label: __( 'Review analytics' ),
		prompt: __( 'Show me my store analytics' ),
	},
	{
		id: 'what-can-you-do',
		label: __( 'What else can you do?' ),
		prompt: __( 'Tell me what you can do for me' ),
	},
];

const useAuthProvider = function () {
	const { site } = useHelpCenterContext();
	return useCallback( () => {
		return wpcomRequest< { token: string } >( {
			path: `/sites/${ site?.ID }/jetpack-openai-query/jwt`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
		} ).then( ( data ) => {
			return {
				authorization: data.token,
			};
		} );
	}, [ site?.ID ] );
};

export function HelpCenterBigSky() {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams( location.search );
	const sessionId = params.get( 'sessionId' );

	useEffect( () => {
		const params = new URLSearchParams( location.search );
		const sessionId = params.get( 'sessionId' );
		if ( ! sessionId ) {
			const sessionId = crypto.randomUUID();
			params.set( 'sessionId', sessionId );
			navigate( `/bigsky?${ params.toString() }`, { replace: true } );
		}
	}, [ location, navigate ] );

	const { messages, isProcessing, error, onSubmit, abortCurrentRequest } = useAgentChat( {
		agentId: 'wp-orchestrator',
		sessionId: sessionId || '',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		authProvider: useAuthProvider(),
	} );

	return (
		<div className="help-center__big-sky agenttic">
			<AgentUI.Container
				messages={ messages as any }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ onSubmit }
				onStop={ abortCurrentRequest }
				variant="embedded"
				emptyView={
					<EmptyView
						heading={ __( 'Howdy! How can I help you today?' ) }
						help={ __( 'Got a different request? Ask away.' ) }
						suggestions={ suggestions }
						icon={ <BigSkyLogo.CentralLogo heartless size={ 50 } fill="#3858E9" /> }
					/>
				}
			>
				<AgentUI.ConversationView>
					<AgentUI.Messages />
					<AgentUI.Footer>
						<AgentUI.Notice />
						<AgentUI.Input />
					</AgentUI.Footer>
					<AgentUI.Suggestions />
				</AgentUI.ConversationView>
			</AgentUI.Container>
		</div>
	);
}
