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
