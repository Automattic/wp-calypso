import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './style.scss';

function P2StepWrapper( {
	flowName,
	stepName,
	headerText,
	subHeaderText,
	positionInFlow,
	children,
} ) {
	const translate = useTranslate();

	return (
		<div className="p2-step-wrapper">
			<div className="p2-step-wrapper__header">
				<div className="p2-step-wrapper__header-logo">
					<img src="/calypso/images/p2/logo.png" width="67" height="32" alt="P2 logo" />
				</div>
				{ headerText && <h1 className="p2-step-wrapper__header-text">{ headerText }</h1> }
				{ subHeaderText && <p className="p2-step-wrapper__subheader-text">{ subHeaderText }</p> }
			</div>
			<StepWrapper
				hideFormattedHeader
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				fallbackHeaderText=""
				stepContent={ children }
			/>
			<div className="p2-step-wrapper__footer">
				<img
					src="/calypso/images/p2/w-logo.png"
					className="p2-step-wrapper__w-logo"
					alt="WP.com logo"
				/>
				<span className="p2-step-wrapper__footer-text">
					{ translate( 'Powered by WordPress.com' ) }
				</span>
			</div>
		</div>
	);
}

P2StepWrapper.propTypes = {
	headerText: PropTypes.string,
	flowName: PropTypes.string,
	stepName: PropTypes.string,
	positionInFlow: PropTypes.number,
	children: PropTypes.node,
};

export default P2StepWrapper;
