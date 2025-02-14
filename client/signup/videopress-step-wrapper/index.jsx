import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './style.scss';

function VideoPressStepWrapper( {
	flowName,
	stepName,
	headerText,
	subHeaderText,
	positionInFlow,
	children,
	className,
} ) {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'videopress-step-wrapper', 'is-videopress-stepper', className ) }>
			<div className="videopress-step-wrapper__middle">
				<div className="videopress-step-wrapper__header">
					{ headerText && (
						<h1 className="wp-brand-font videopress-step-wrapper__header-text">{ headerText }</h1>
					) }
					{ subHeaderText && (
						<p className="videopress-step-wrapper__subheader-text">{ subHeaderText }</p>
					) }
				</div>
				<StepWrapper
					hideFormattedHeader
					shouldHideNavButtons
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					fallbackHeaderText=""
					stepContent={ children }
				/>
				<div className="videopress-step-wrapper__footer">
					<img
						src="/calypso/images/p2/w-logo-white.png"
						className="videopress-step-wrapper__w-logo"
						alt="WP.com logo"
					/>
					<span className="videopress-step-wrapper__footer-text">
						{ translate( 'Powered by WordPress.com' ) }
					</span>
				</div>
			</div>
		</div>
	);
}

VideoPressStepWrapper.propTypes = {
	headerText: PropTypes.node,
	subHeaderText: PropTypes.node,
	showHeaderLogout: PropTypes.bool,
	flowName: PropTypes.string,
	stepName: PropTypes.string,
	positionInFlow: PropTypes.number,
	children: PropTypes.node,
};

export default VideoPressStepWrapper;
