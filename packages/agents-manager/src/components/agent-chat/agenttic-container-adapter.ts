import { AgentUI } from '@automattic/agenttic-ui';
import type { ComponentProps, ComponentType } from 'react';

type ContainerProps = ComponentProps< typeof AgentUI.Container > & {
	submitBlocked?: boolean;
	onBlockedSubmit?: ( message: string ) => void;
};

const Container = AgentUI.Container as ComponentType< ContainerProps >;

export { Container as AgentticContainer };
