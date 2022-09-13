import { Path, SVG, Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import './style.scss';

function VideoPressStepWrapper( {
	flowName,
	stepName,
	headerIcon,
	headerText,
	subHeaderText,
	stepIndicator,
	showHeaderLogout,
	positionInFlow,
	children,
	className,
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<div className={ classnames( 'videopress-step-wrapper', className ) }>
			<div className="videopress-step-wrapper__top">
				<div className="videopress-step-wrapper__header-logo">
					<SVG xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
						<Path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M2.79037 0.59375C4.0363 0.59375 5.13102 1.41658 5.47215 2.60947L8.8452 14.4044C8.8486 14.4164 8.85411 14.4273 8.86124 14.4368L12.8572 0.59375H15.0927H21.2721C25.6033 0.59375 28.5066 3.39892 28.5066 7.64565C28.5066 11.9411 25.5272 14.6196 21.0818 14.6196H18.1499H14.3719L13.6379 16.8813C12.9796 18.9095 11.0827 20.2839 8.94152 20.2839C6.80035 20.2839 4.90341 18.9095 4.24517 16.8813L0.137069 4.22276C-0.444671 2.43022 0.898038 0.59375 2.79037 0.59375ZM15.7374 10.4119H20.0156C21.8718 10.4119 22.9856 9.35018 22.9856 7.64565C22.9856 5.93137 21.8718 4.91839 20.0156 4.91839H17.5202L15.7374 10.4119Z"
							fill="none"
						/>
					</SVG>
					<span>VideoPress</span>
				</div>
				{ stepIndicator && (
					<div className="videopress-step-wrapper__header-step-indicator">{ stepIndicator }</div>
				) }
				{ ! stepIndicator && showHeaderLogout && (
					<div className="videopress-step-wrapper__header-logout">
						<Button
							onClick={ () => {
								dispatch( redirectToLogout() );
							} }
						>
							{ translate( 'Log out' ) }
						</Button>
					</div>
				) }
			</div>
			<div className="videopress-step-wrapper__middle">
				<div className="videopress-step-wrapper__header">
					{ headerIcon && (
						<div className="videopress-step-wrapper__header-icon">
							<Icon icon={ headerIcon } />
						</div>
					) }
					{ headerText && (
						<h1 className="wp-brand-font videopress-step-wrapper__header-text">{ headerText }</h1>
					) }
					{ subHeaderText && (
						<p className="videopress-step-wrapper__subheader-text">{ subHeaderText }</p>
					) }
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
	stepIndicator: PropTypes.string,
	showHeaderLogout: PropTypes.bool,
	flowName: PropTypes.string,
	stepName: PropTypes.string,
	positionInFlow: PropTypes.number,
	children: PropTypes.node,
};

export default VideoPressStepWrapper;
