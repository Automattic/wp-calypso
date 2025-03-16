import { StepContainerV2Provider } from '..';

export const withStepContainerV2ContextDecorator = ( Story: React.ComponentType ) => {
	return (
		<StepContainerV2Provider
			value={ { flowName: 'flowName', stepName: 'stepName', recordTracksEvent: () => {} } }
		>
			<Story />
		</StepContainerV2Provider>
	);
};

export function WireframePlaceholder( {
	height,
	children,
}: {
	height?: number;
	children?: React.ReactNode;
} ) {
	const style = {
		background: '#ff80ff',
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		...( height && { height } ),
	};

	return <div style={ style }>{ children }</div>;
}
