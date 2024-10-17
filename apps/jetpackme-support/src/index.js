/**
 * External dependencies
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';
/**
 * Internal dependencies
 */
import SupportPrompt from './support-prompt';

window.renderSupportPrompt = ( elementId ) => {
	const queryClient = new QueryClient();

	render(
		<QueryClientProvider client={ queryClient }>
			<SupportPrompt />
		</QueryClientProvider>,
		document.getElementById( elementId )
	);
};
