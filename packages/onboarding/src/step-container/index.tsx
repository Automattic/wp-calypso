import { WordPressLogo } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactChild, ReactElement } from 'react';
import ActionButtons from '../action-buttons';
import StepNavigationLink from '../step-navigation-link';
import './style.scss';

interface Props {
	stepName: string;
	stepSectionName?: string;
	stepContent: ReactElement;
	shouldHideNavButtons?: boolean;
	shouldStickyNavButtons?: boolean;
	hasStickyNavButtonsPadding?: boolean;
	hideBack?: boolean;
	hideSkip?: boolean;
	hideNext?: boolean;
	skipButtonAlign?: 'top' | 'bottom';
	skipHeadingText?: string;
	backLabelText?: string | ReactChild;
	skipLabelText?: string | ReactChild;
	nextLabelText?: string | ReactChild;
	formattedHeader?: ReactElement;
	hideFormattedHeader?: boolean;
	headerImageUrl?: string;
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
	stepProgress?: { count: number; progress: number };
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
}

const StepContainer: React.FC< Props > = ( {
	stepContent,
	stepName,
	shouldHideNavButtons,
	shouldStickyNavButtons,
	hasStickyNavButtonsPadding,
	hideBack,
	backLabelText,
	hideSkip,
	skipLabelText,
	skipButtonAlign = 'top',
	skipHeadingText,
	hideNext = true,
	nextLabelText,
	formattedHeader,
	headerImageUrl,
	headerButton,
	hideFormattedHeader,
	className,
	isHorizontalLayout,
	isFullLayout,
	isWideLayout,
	isExternalBackUrl,
	isLargeSkipLayout,
	customizedActionButtons,
	goBack,
	goNext,
	flowName,
	intent,
	stepSectionName,
	recordTracksEvent,
} ) => {
	const translate = useTranslate();

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

	function BackButton() {
		if ( shouldHideNavButtons ) {
			return null;
		}
		return (
			<StepNavigationLink
				direction="back"
				handleClick={ goBack }
				label={ backLabelText }
				hasBackIcon
				rel={ isExternalBackUrl ? 'external' : '' }
				recordClick={ () => recordClick( 'back', stepSectionName ) }
			/>
		);
	}

	function SkipButton() {
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
					borderless={ true }
					recordClick={ () => recordClick( 'forward' ) }
				/>
			</div>
		);
	}

	function NextButton() {
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

	const classes = classNames( 'step-container', className, flowName, stepName, {
		'is-horizontal-layout': isHorizontalLayout,
		'is-wide-layout': isWideLayout,
		'is-full-layout': isFullLayout,
		'is-large-skip-layout': isLargeSkipLayout,
		'has-navigation': ! shouldHideNavButtons,
	} );

	return (
		<div className={ classes }>
			<ActionButtons
				className={ classNames( 'step-container__navigation', {
					'should-hide-nav-buttons': shouldHideNavButtons,
					'should-sticky-nav-buttons': shouldStickyNavButtons,
					'has-sticky-nav-buttons-padding': hasStickyNavButtonsPadding,
				} ) }
			>
				{ shouldStickyNavButtons && (
					<WordPressLogo className="step-container__navigation-logo" size={ 24 } />
				) }
				{ ! hideBack && <BackButton /> }
				{ ! hideSkip && skipButtonAlign === 'top' && <SkipButton /> }
				{ ! hideNext && <NextButton /> }
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
					{ headerButton && <div className="step-container__header-button">{ headerButton }</div> }
				</div>
			) }

			<div className="step-container__content">{ stepContent }</div>

			{ ! hideSkip && skipButtonAlign === 'bottom' && (
				<div className="step-container__buttons">
					{ isLargeSkipLayout && <hr className="step-container__skip-hr" /> }
					{ <SkipButton /> }
				</div>
			) }
		</div>
	);
};

export default StepContainer;
