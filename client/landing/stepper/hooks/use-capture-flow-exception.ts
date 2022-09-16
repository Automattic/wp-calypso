import { useCallback } from 'react';
import { captureException } from 'calypso/lib/sentry';
import { useFlowParam } from './use-flow-param';
import { useIntent } from './use-intent';
import { useSite } from './use-site';

const useCaptureFlowException = ( stepName: string ) => {
	const flow = useFlowParam() || 'default';
	const intent = useIntent() || null;
	const site = useSite();

	return useCallback(
		( error: any ) => {
			captureException( error, {
				tags: {
					blog_id: site?.ID || null,
					calypso_section: 'setup',
					flow,
					intent,
					stepName,
				},
			} );
		},
		[ flow, intent, site ]
	);
};

export default useCaptureFlowException;
