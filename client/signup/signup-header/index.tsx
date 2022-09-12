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

const VARIATION_TITLES: Record< string, string > = {
	newsletter: 'Newsletter',
	'link-in-bio': 'Link in Bio',
	videopress: 'Video Portfolio',
};

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
	const variationTitle = variationName && VARIATION_TITLES[ variationName ];
	const showPageTitle = ( params.has( 'pageTitle' ) && variationTitle ) || Boolean( pageTitle );
	const variablePageTitle = variationTitle || pageTitle;
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
			{ showPageTitle && <h1>{ variablePageTitle } </h1> }
			{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
			<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
		</div>
	);
};

export default SignupHeader;
