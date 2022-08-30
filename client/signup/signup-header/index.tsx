import { ProgressBar } from '@automattic/components';
import { useFlowProgress } from '@automattic/onboarding';
import classnames from 'classnames';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

interface ProgressBarData {
	flowName?: string;
	stepName?: string;
}

interface Props {
	progressBar?: ProgressBarData;
	shouldShowLoadingScreen?: boolean;
	isReskinned?: boolean;
	rightComponent?: Node;
	pageTitle?: string;
}

const SignupHeader = ( {
	shouldShowLoadingScreen,
	isReskinned,
	rightComponent,
	progressBar = {},
	pageTitle,
}: Props ) => {
	const logoClasses = classnames( 'wordpress-logo', {
		'is-large': shouldShowLoadingScreen && ! isReskinned,
	} );
	const params = new URLSearchParams( window.location.search );
	const variationName = params.get( 'variationName' );
	const variationPageTitle = params.get( 'pageTitle' );
	const variablePageTitle = variationPageTitle || pageTitle;
	const flowProgress = useFlowProgress(
		variationName ? { flowName: variationName, stepName: progressBar.stepName } : progressBar
	);

	return (
		<div className="signup-header">
			{ flowProgress && ! shouldShowLoadingScreen && (
				<ProgressBar
					className={ variationName ? variationName : progressBar.flowName }
					value={ flowProgress.progress }
					total={ flowProgress.count }
				/>
			) }
			<WordPressLogo size={ 120 } className={ logoClasses } />
			{ variablePageTitle && <h1>{ variablePageTitle as string } </h1> }
			{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
			<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
		</div>
	);
};

export default SignupHeader;
