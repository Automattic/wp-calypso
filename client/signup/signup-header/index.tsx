import { ProgressBar, WooCommerceWooLogo } from '@automattic/components';
import { useFlowProgress, FREE_FLOW } from '@automattic/onboarding';
import clsx from 'clsx';
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
	rightComponent?: React.ReactNode;
	pageTitle?: string;
	showWooLogo?: boolean;
}

const SignupHeader = ( {
	shouldShowLoadingScreen,
	isReskinned,
	rightComponent,
	progressBar = {},
	pageTitle,
	showWooLogo = false,
}: Props ) => {
	const translate = useTranslate();
	const VARIATION_TITLES: Record< string, string > = {
		videopress: translate( 'Video' ),
	};
	const params = new URLSearchParams( window.location.search );
	const variationName = params.get( 'variationName' );
	const variationTitle = variationName && VARIATION_TITLES[ variationName ];
	const showPageTitle = variationTitle || params.has( 'pageTitle' ) || Boolean( pageTitle );
	const variablePageTitle = variationTitle || pageTitle || params.get( 'pageTitle' );
	const flowProgress = useFlowProgress(
		variationName ? { flowName: variationName, stepName: progressBar.stepName } : progressBar
	);
	const showProgressBar = progressBar.flowName !== FREE_FLOW;

	const logoClasses = clsx( 'wordpress-logo', {
		'is-large': shouldShowLoadingScreen && ! isReskinned,
	} );

	return (
		<>
			<div className="signup-header" role="banner" aria-label="banner">
				{ flowProgress &&
					! shouldShowLoadingScreen &&
					showProgressBar &&
					flowProgress?.progress > 0 && (
						<ProgressBar
							className={ variationName ? variationName : progressBar.flowName }
							value={ flowProgress.progress }
							total={ flowProgress.count }
						/>
					) }
				{ ! showWooLogo && <WordPressLogo size={ 120 } className={ logoClasses } /> }
				{ showWooLogo && (
					<WooCommerceWooLogo width={ 120 } height={ 120 } className={ logoClasses } />
				) }
				{ showPageTitle && <h1>{ variablePageTitle }</h1> }
				{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
				<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
			</div>
		</>
	);
};

export default SignupHeader;
