import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './style.scss';

function GravatarStepWrapper( {
	flowName,
	stepName,
	headerText,
	subHeaderText,
	positionInFlow,
	children,
	loginUrl,
	logo,
} ) {
	const translate = useTranslate();

	return (
		<div className="gravatar-step-wrapper">
			<div className="gravatar-step-wrapper__innder">
				<img src={ logo.url } width={ 27 } height={ 27 } alt={ logo.alt } />
				<h1 className="gravatar-step-wrapper__header">{ headerText }</h1>
				<p className="gravatar-step-wrapper__sub-header">{ subHeaderText }</p>
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
				<div className="gravatar-step-wrapper__footer">
					<div>
						{ translate( 'Do you have already an account? {{a}}Log in{{/a}}.', {
							components: {
								a: <a href={ loginUrl } />,
							},
						} ) }
					</div>
					<div>
						{ translate( 'Any question? {{a}}Check our help docs{{/a}}.', {
							components: {
								a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
							},
						} ) }
					</div>
				</div>
			</div>
		</div>
	);
}

GravatarStepWrapper.propTypes = {
	headerText: PropTypes.node.isRequired,
	subHeaderText: PropTypes.node.isRequired,
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
	children: PropTypes.node.isRequired,
	loginUrl: PropTypes.string.isRequired,
	logo: PropTypes.shape( { url: PropTypes.string, alt: PropTypes.string } ).isRequired,
};

export default GravatarStepWrapper;
