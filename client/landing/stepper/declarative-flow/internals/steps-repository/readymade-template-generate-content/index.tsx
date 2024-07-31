import { __experimentalNavigatorProvider as NavigatorProvider } from '@wordpress/components';
import { useInitialPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/hooks';
import type { Step } from '../../types';

const ReadymadeTemplateGenerateContent = () => {
	return (
		<div>
			<h1>Generate Content with Me</h1>
			<p>Launchpad things here for reasons</p>
		</div>
	);
};

const ReadymadeTemplateGenerateContentStep: Step = () => {
	const initialPath = useInitialPath();

	return (
		<NavigatorProvider initialPath={ initialPath } tabIndex={ -1 }>
			<ReadymadeTemplateGenerateContent />
		</NavigatorProvider>
	);
};

export default ReadymadeTemplateGenerateContentStep;
