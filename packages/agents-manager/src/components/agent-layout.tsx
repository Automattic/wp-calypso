import lazyComponent from '../utils/lazy-component';
import AgentDock from './agent-dock';
import type { ComponentProps, ComponentType } from 'react';

const FullscreenLayout = lazyComponent(
	() => import( /* webpackChunkName: "am-fullscreen" */ './fullscreen-layout' )
) as ComponentType< ComponentProps< typeof AgentDock > >;

export function AgentLayout( {
	isFullscreen,
	...props
}: ComponentProps< typeof AgentDock > & { isFullscreen: boolean } ) {
	const Layout = isFullscreen ? FullscreenLayout : AgentDock;
	return <Layout { ...props } />;
}
