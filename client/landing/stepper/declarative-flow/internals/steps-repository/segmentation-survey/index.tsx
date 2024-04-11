import { Button } from '@wordpress/components';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step } from '../../types';
import './style.scss';

const SegmentationSurveyStep: Step = ( { navigation } ) => {
	const docTitle = 'Segmentation Survey';

	const handleNext = () => {
		alert(
			`Do not use navigation.goNext() here. Instead, update URL params (not route fragments).`
		);
	};

	const handleBack = () => {
		alert(
			`Do not use navigation.goBack()() here. Instead, update URL params (not route fragments).`
		);
	};

	const handleSubmit = () => {
		navigation.submit();
	};

	return (
		<>
			<DocumentHead title={ docTitle } />
			<div className="segmentation-survey">
				<p>Back & Next button can modify URL params, but not the route itself.</p>
				<Button onClick={ handleBack } variant="secondary">
					Back
				</Button>
				<Button onClick={ handleNext } variant="secondary">
					Next
				</Button>
				<hr />
				<p>Insert segmentation survey component here.</p>
				<p>
					Submit button goes to Login/Signup/SiteCreation step. Call this when segmentation survey
					is completed (or skipped).
				</p>
				<Button onClick={ handleSubmit } variant="primary">
					Submit
				</Button>
			</div>
		</>
	);
};

export default SegmentationSurveyStep;
