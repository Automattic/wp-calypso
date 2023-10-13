import { createHigherOrderComponent } from '@wordpress/compose';
import { AsyncToastProvider } from 'calypso/components/async-toast/context';
import { SiteId } from 'calypso/types';

export const withAsyncToastProvider = createHigherOrderComponent( ( Wrapped ) => {
	const WithAsyncToast = ( props: { selectedSiteId: SiteId } ) => {
		console.log( 'WITH ASYNC TOAST ZZ' );
		console.log( props );
		const { selectedSiteId } = props;

		return (
			<AsyncToastProvider selectedSiteId={ selectedSiteId }>
				<Wrapped { ...props } />
			</AsyncToastProvider>
		);
	};

	return WithAsyncToast;
}, 'WithAsyncToast' );
