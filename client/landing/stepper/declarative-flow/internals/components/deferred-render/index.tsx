import { useDeferredRender } from './use-deferred-render';

interface DelayedRenderProps {
	children: React.ReactNode;
	timeMs?: number;
}

export const DeferredRender = ( { children, timeMs = 1000 }: DelayedRenderProps ) => {
	const { isReadyToRender } = useDeferredRender( { timeMs } );

	if ( ! isReadyToRender ) {
		return null;
	}

	return <>{ children }</>;
};
