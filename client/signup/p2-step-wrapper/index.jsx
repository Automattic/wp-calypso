import { Path, SVG } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import StepWrapper from 'calypso/signup/step-wrapper';
import './style.scss';
import './style-p2new.scss';

function P2StepWrapper( {
	flowName,
	stepName,
	headerIcon,
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
					<SVG xmlns="http://www.w3.org/2000/svg" width="67" height="32" viewBox="0 0 67 32">
						<Path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M1.99451 0C0.892972 0 0 0.895431 0 2V30C0 31.1046 0.892973 32 1.99451 32H30.0055C31.107 32 32 31.1046 32 30V2C32 0.895431 31.107 0 30.0055 0H1.99451ZM22.1177 7.52942H9.41177V16H22.1177V7.52942ZM9.41177 18.8235H17.8824V24.4706H9.41177V18.8235Z"
							fill="none"
						/>
						<Path
							d="M54.7535 24.4461H66.8161V21.5213H59.7107V21.4057L62.1811 18.9849C65.6594 15.8123 66.593 14.226 66.593 12.3009C66.593 9.3679 64.197 7.29413 60.57 7.29413C57.0173 7.29413 54.58 9.41747 54.5883 12.7388H57.984C57.9757 11.1194 59.0002 10.128 60.5452 10.128C62.0324 10.128 63.1395 11.0534 63.1395 12.5405C63.1395 13.8872 62.3133 14.8126 60.7765 16.2915L54.7535 21.8684V24.4461Z"
							fill="none"
						/>
						<Path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M39.5294 24.4706H43.0973V18.9779H46.0966C49.9776 18.9779 52.2353 16.6535 52.2353 13.2702C52.2353 9.9035 50.0188 7.52942 46.1872 7.52942H39.5294V24.4706ZM43.0973 16.1075V10.4577H45.5033C47.5633 10.4577 48.5603 11.5827 48.5603 13.2702C48.5603 14.9495 47.5633 16.1075 45.5198 16.1075H43.0973Z"
							fill="none"
						/>
					</SVG>
				</div>
				{ headerIcon && (
					<div className="p2-step-wrapper__header-icon">
						<Icon icon={ headerIcon } />
					</div>
				) }
				{ headerText && <h1 className="p2-step-wrapper__header-text">{ headerText }</h1> }
				{ subHeaderText && <p className="p2-step-wrapper__subheader-text">{ subHeaderText }</p> }
			</div>
			<StepWrapper
				hideFormattedHeader
				shouldHideNavButtons={ true }
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
