import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './style.scss';

function GravatarStepWrapper( {
	flowName,
	stepName,
	headerText,
	positionInFlow,
	children,
	loginUrl,
} ) {
	const translate = useTranslate();

	return (
		<div className="gravatar-step-wrapper">
			<div className="gravatar-step-wrapper__innder">
				<svg xmlns="http://www.w3.org/2000/svg" width="27" height="28" viewBox="0 0 27 28">
					<path
						d="M10.8001 3.199V12.649C10.8001 13.3648 11.0845 14.0513 11.5907 14.5575C12.0968 15.0636 12.7833 15.348 13.4991 15.348C14.215 15.348 14.9015 15.0636 15.4076 14.5575C15.9138 14.0513 16.1981 13.3648 16.1981 12.649V6.362C17.8547 6.94603 19.2766 8.05265 20.2494 9.5151C21.2223 10.9776 21.6935 12.7166 21.5921 14.4702C21.4906 16.2237 20.8219 17.8968 19.6868 19.2372C18.5517 20.5777 17.0116 21.5129 15.2988 21.9019C13.5859 22.2909 11.793 22.1127 10.1902 21.3941C8.58746 20.6754 7.26169 19.4553 6.41271 17.9176C5.56372 16.3799 5.23752 14.608 5.48326 12.8687C5.729 11.1295 6.53336 9.51729 7.77514 8.275C8.27319 7.76652 8.5505 7.08205 8.54681 6.3703C8.54312 5.65854 8.25874 4.97698 7.75545 4.47369C7.25215 3.9704 6.5706 3.68602 5.85884 3.68233C5.14708 3.67864 4.46262 3.95595 3.95414 4.454C1.74559 6.66252 0.371155 9.56851 0.0650236 12.6768C-0.241108 15.7851 0.540006 18.9034 2.27527 21.5003C4.01053 24.0973 6.59258 26.0122 9.58145 26.9188C12.5703 27.8254 15.7811 27.6676 18.6666 26.4722C21.5522 25.2769 23.934 23.118 25.4062 20.3634C26.8784 17.6088 27.35 14.4289 26.7405 11.3657C26.131 8.30236 24.4782 5.54516 22.0637 3.56388C19.6493 1.58259 16.6225 0.499796 13.4991 0.5C12.7833 0.5 12.0968 0.784358 11.5907 1.29052C11.0845 1.79668 10.8001 2.48318 10.8001 3.199Z"
						fill="#1D4FC4"
					/>
				</svg>
				<h1 className="gravatar-step-wrapper__title">{ headerText }</h1>
				<StepWrapper
					shouldHideNavButtons
					hideFormattedHeader
					hideSkip
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					stepContent={ children }
				/>
				<hr className="gravatar-step-wrapper__divider" />
				<div className="gravatar-step-wrapper__login">
					{ translate( 'Do you have already an account? {{a}}Log in{{/a}}.', {
						components: {
							a: <a href={ loginUrl } />,
						},
					} ) }
				</div>
				<div className="gravatar-step-wrapper__support">
					{ translate( 'Any question? {{a}}Check our help docs{{/a}}.', {
						components: {
							a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
						},
					} ) }
				</div>
			</div>
		</div>
	);
}

GravatarStepWrapper.propTypes = {
	headerText: PropTypes.node.isRequired,
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
	children: PropTypes.node.isRequired,
	loginUrl: PropTypes.string.isRequired,
};

export default GravatarStepWrapper;
