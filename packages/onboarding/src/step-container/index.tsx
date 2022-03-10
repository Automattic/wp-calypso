import { ActionButtons } from '@automattic/onboarding';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactChild, ReactElement } from 'react';
import StepNavigationLink from '../step-navigation-link';
import './style.scss';

interface Props {
	headerText: string | ReactChild;
	subHeaderText: string | ReactChild;
	stepContent: ReactElement;
	hideBack?: boolean;
	hideSkip?: boolean;
	hideNext?: boolean;
	formattedHeader?: ReactElement;
	shouldHideNavButtons?: boolean;
	skipButtonAlign?: 'top' | 'bottom';
	skipHeadingText?: string;
	hideFormattedHeader?: boolean;
	headerImageUrl?: string;
	backLabelText?: string;
	skipLabelText?: string;
	nextLabelText?: string;
	align: 'left' | 'center';
	className?: string;
	// Displays an <hr> above the skip button and adds more white space
	isLargeSkipLayout?: boolean;
	isExternalBackUrl?: boolean;
	headerButton?: ReactElement;
	customizedActionButtons?: ReactElement;
	isWideLayout?: boolean;
	isFullLayout?: boolean;
	isHorizontalLayout?: boolean;
	goBack?: () => void;
	goNext?: () => void;
	flowName?: string;
	intent?: string;
	stepName?: string;
	stepSectionName?: string;
	recordTracksEvent: () => void;
}

const StepContainer: React.FC< Props > = ( {
	headerText,
	subHeaderText,
	stepContent,
	hideBack,
	hideSkip,
	hideNext = true,
	formattedHeader,
	shouldHideNavButtons,
	skipButtonAlign = 'bottom',
	skipHeadingText,
	headerImageUrl,
	hideFormattedHeader,
	backLabelText,
	skipLabelText,
	nextLabelText,
	align,
	className,
	isHorizontalLayout,
	isFullLayout,
	isWideLayout,
	headerButton,
	isExternalBackUrl,
	isLargeSkipLayout,
	customizedActionButtons,
	goBack,
	goNext,
	flowName,
	intent,
	stepName,
	stepSectionName,
	recordTracksEvent,
} ) => {
	const translate = useTranslate();

	const isReskinnedFlow = ( flowName: string | undefined ) => {
		if ( ! flowName ) {
			return false;
		}
		return true;
		// return (
		// 	config.isEnabled( 'signup/reskin' ) &&
		// 	config< string >( 'reskinned_flows' ).includes( flowName )
		// );
	};

	const recordClick = ( direction: 'back' | 'forward', stepSectionName?: string ) => {
		const tracksProps = {
			flow: flowName,
			step: stepName,
			intent: intent,
		};

		// We don't need to track if we are in the sub-steps since it's not really going back a step
		if ( direction === 'back' && ! stepSectionName ) {
			recordTracksEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( direction === 'forward' ) {
			recordTracksEvent( 'calypso_signup_skip_step', tracksProps );
		}
	};

	function renderBack() {
		if ( shouldHideNavButtons ) {
			return null;
		}
		return (
			<StepNavigationLink
				direction="back"
				handleClick={ goBack }
				label={ backLabelText }
				backIcon={ isReskinnedFlow( flowName ) ? 'chevron-left' : undefined }
				rel={ isExternalBackUrl ? 'external' : '' }
				recordClick={ () => recordClick( 'back', stepSectionName ) }
			/>
		);
	}

	function renderSkip( {
		borderless,
		forwardIcon,
	}: {
		borderless: boolean;
		forwardIcon?: string;
	} ) {
		if ( shouldHideNavButtons || ! goNext ) {
			return null;
		}

		return (
			<div className="step-container__skip-wrapper">
				{ skipHeadingText && (
					<div className="step-container__skip-heading">{ skipHeadingText }</div>
				) }
				<StepNavigationLink
					direction="forward"
					handleClick={ goNext }
					label={ skipLabelText }
					cssClass={ classNames( 'step-container__navigation-link', 'has-underline', {
						'has-skip-heading': skipHeadingText,
					} ) }
					borderless={ borderless }
					forwardIcon={ forwardIcon }
					recordClick={ () => recordClick( 'forward' ) }
				/>
			</div>
		);
	}

	function renderNext() {
		if ( shouldHideNavButtons || ! goNext ) {
			return null;
		}

		return (
			<StepNavigationLink
				direction="forward"
				handleClick={ goNext }
				label={ nextLabelText || translate( 'Continue' ) }
				cssClass="step-container__navigation-link"
				borderless={ false }
				primary
			/>
		);
	}

	function getHeaderText() {
		return headerText ? headerText : translate( 'Let’s get started' );
	}

	function getSubHeaderText() {
		return subHeaderText
			? subHeaderText
			: translate( 'Welcome to the best place for your WordPress website.' );
	}

	const backButton = ! hideBack && renderBack();
	const skipButton = ! hideSkip && skipButtonAlign === 'top' && renderSkip( { borderless: true } );
	const nextButton = ! hideNext && renderNext();
	const hasNavigation = backButton || skipButton || nextButton || customizedActionButtons;
	const classes = classNames( 'step-container', className, {
		'is-horizontal-layout': isHorizontalLayout,
		'is-wide-layout': isWideLayout,
		'is-full-layout': isFullLayout,
		'is-large-skip-layout': isLargeSkipLayout,
		'has-navigation': hasNavigation,
	} );

	return (
		<>
			<div className={ classes }>
				<ActionButtons
					className="step-container__navigation"
					sticky={ isReskinnedFlow( flowName ) ? null : false }
				>
					{ backButton }
					{ skipButton }
					{ nextButton }
					{ customizedActionButtons }
				</ActionButtons>
				{ ! hideFormattedHeader && (
					<div className="step-container__header">
						{ formattedHeader }
						{ headerImageUrl && (
							<div className="step-container__header-image">
								<img src={ headerImageUrl } alt="" />
							</div>
						) }
						{ headerButton && (
							<div className="step-container__header-button">{ headerButton }</div>
						) }
					</div>
				) }

				<div className="step-container__content">{ stepContent }</div>

				{ ! hideSkip && skipButtonAlign === 'bottom' && (
					<div className="step-container__buttons">
						{ isLargeSkipLayout && <hr className="step-container__skip-hr" /> }
						{ renderSkip( { borderless: true } ) }
					</div>
				) }
			</div>
		</>
	);
};

export default StepContainer;
