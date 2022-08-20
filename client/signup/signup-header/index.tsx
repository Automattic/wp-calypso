import { useFlowProgress } from '@automattic//onboarding';
import { ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

interface ProgressBarData {
	flowName: string;
	stepName: string;
}

interface Props {
	shouldShowLoadingScreen?: boolean;
	isReskinned?: boolean;
	rightComponent?: Node;
	pageTitle?: string;
	progressBar?: ProgressBarData;
}

const SignupHeader = ( {
	pageTitle,
	shouldShowLoadingScreen,
	isReskinned,
	rightComponent,
	progressBar,
}: Props ) => {
	const logoClasses = classnames( 'wordpress-logo', {
		'is-large': shouldShowLoadingScreen && ! isReskinned,
	} );
	const hasFlowProgress = useFlowProgress( progressBar );

	return (
		<div className="signup-header">
			{ progressBar && hasFlowProgress && (
				<ProgressBar
					className={ progressBar.flowName }
					value={ hasFlowProgress.progress }
					total={ hasFlowProgress.count }
				/>
			) }
			<WordPressLogo size={ 120 } className={ logoClasses } />
			{ pageTitle && <h1>{ pageTitle }</h1> }
			{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
			<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
		</div>
	);
};

export default SignupHeader;
