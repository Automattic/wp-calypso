import { ProgressBar } from '@automattic/components';
import {
	useFlowProgress,
	FREE_FLOW,
	LINK_IN_BIO_FLOW,
	LINK_IN_BIO_TLD_FLOW,
} from '@automattic/onboarding';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	const VARIATION_TITLES: Record< string, string > = {
		newsletter: translate( 'Newsletter' ),
		[ LINK_IN_BIO_FLOW ]: translate( 'Link in Bio' ),
		[ LINK_IN_BIO_TLD_FLOW ]: translate( 'Link in Bio' ),
		videopress: translate( 'Video' ),
	};
	const params = new URLSearchParams( window.location.search );
	const variationName = params.get( 'variationName' );
	const variationTitle = variationName && VARIATION_TITLES[ variationName ];
	const showPageTitle = ( params.has( 'pageTitle' ) && variationTitle ) || Boolean( pageTitle );
	const variablePageTitle = variationTitle || pageTitle;
	const flowProgress = useFlowProgress(
		variationName ? { flowName: variationName, stepName: progressBar.stepName } : progressBar
	);
	const showProgressBar = progressBar.flowName !== FREE_FLOW;

	return (
		<div className="signup-header" role="banner" aria-label="banner">
			{ flowProgress && ! shouldShowLoadingScreen && showProgressBar && (
				<ProgressBar
					className={ variationName ? variationName : progressBar.flowName }
					value={ flowProgress.progress }
					total={ flowProgress.count }
				/>
			) }
			<WordPressLogo size={ 120 } className={ logoClasses } />
			{ showPageTitle && <h1>{ variablePageTitle }</h1> }
			{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
			<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
		</div>
	);
};

export default SignupHeader;
