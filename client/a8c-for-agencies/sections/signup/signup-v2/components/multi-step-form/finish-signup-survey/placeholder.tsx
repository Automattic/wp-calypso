import Form from 'calypso/a8c-for-agencies/components/form';

import './style.scss';

export default function FinishSignupSurveyPlaceHolder() {
	return (
		<Form className="signup-finish-survey">
			<div className="signup-finish-survey__content">
				<span className="signup-finish-survey__content-placeholder" style={ { width: '80%' } } />
				<span className="signup-finish-survey__content-placeholder" style={ { width: '60%' } } />
				<span className="signup-finish-survey__content-placeholder" style={ { width: '65%' } } />
			</div>
		</Form>
	);
}
