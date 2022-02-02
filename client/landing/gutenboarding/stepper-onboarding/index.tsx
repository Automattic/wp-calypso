import { useStepNavigation } from './hooks/use-step-navigation';

const appSteps = {
	first: 'first step',
	second: 'second step',
	third: 'third step',
};

export function Stepper() {
	const { currentStep, goNext, goBack } = useStepNavigation();

	return (
		<div>
			<div>{ appSteps[ currentStep ] }</div>
			<button onClick={ goBack }>Previous step</button>
			<button onClick={ goNext }>Next step</button>
		</div>
	);
}

export default function App() {
	return <Stepper />;
}
