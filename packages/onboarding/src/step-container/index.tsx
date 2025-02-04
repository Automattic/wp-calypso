import { JetpackLogo, WooCommerceWooLogo } from '@automattic/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import ActionButtons from '../action-buttons';
import StepNavigationLink from '../step-navigation-link';
import './style.scss';

interface Props {
	stepName: string;
	stepSectionName?: string;
	stepContent: ReactElement;
	shouldHideNavButtons?: boolean;
	hasStickyNavButtonsPadding?: boolean;
	hideBack?: boolean;
	hideSkip?: boolean;
	hideNext?: boolean;
	skipButtonAlign?: 'top' | 'bottom';
	skipHeadingText?: string;
	backLabelText?: TranslateResult;
	skipLabelText?: TranslateResult;
	nextLabelText?: TranslateResult;
	notice?: ReactElement;
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
	isExtraWideLayout?: boolean;
	isFullLayout?: boolean;
	isHorizontalLayout?: boolean;
	goBack?: () => void;
	onSkip?: () => void;
	goNext?: () => void;
	flowName?: string;
	intent?: string;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
	showHeaderJetpackPowered?: boolean;
	showJetpackPowered?: boolean;
	showHeaderWooCommercePowered?: boolean;
	showFooterWooCommercePowered?: boolean;
	backUrl?: string;
}

const StepContainer: React.FC< Props > = ( {
	stepContent,
	stepName,
	shouldHideNavButtons,
	hasStickyNavButtonsPadding,
	hideBack,
	backLabelText,
	hideSkip,
	skipLabelText,
	skipButtonAlign = 'top',
	skipHeadingText,
	hideNext = true,
	nextLabelText,
	notice,
	formattedHeader,
	headerImageUrl,
	headerButton,
	hideFormattedHeader,
	className,
	isHorizontalLayout,
	isFullLayout,
	isWideLayout,
	isExtraWideLayout,
	isExternalBackUrl,
	isLargeSkipLayout,
	customizedActionButtons,
	backUrl,
	goBack,
	onSkip,
	goNext,
	flowName,
	intent,
	stepSectionName,
	recordTracksEvent,
	showHeaderJetpackPowered,
	showHeaderWooCommercePowered,
	showJetpackPowered,
	showFooterWooCommercePowered,
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

	function renderBackButton() {
		// Hide back button if goBack is falsy, it won't do anything in that case.
		if ( shouldHideNavButtons || ( ! goBack && ! backUrl ) ) {
			return null;
		}
		return (
			<StepNavigationLink
				direction="back"
				handleClick={ goBack }
				backUrl={ backUrl }
				label={ backLabelText }
				hasBackIcon
				rel={ isExternalBackUrl ? 'external' : '' }
				recordClick={ () => recordClick( 'back', stepSectionName ) }
			/>
		);
	}

	function renderSkipButton() {
		const skipAction = onSkip ?? goNext;

		if ( shouldHideNavButtons || ! skipAction ) {
			return null;
		}

		return (
			<div className="step-container__skip-wrapper">
				{ skipHeadingText && (
					<div className="step-container__skip-heading">{ skipHeadingText }</div>
				) }
				<StepNavigationLink
					direction="forward"
					handleClick={ skipAction }
					label={ skipLabelText }
					cssClass={ clsx( 'step-container__navigation-link', 'has-underline', {
						'has-skip-heading': skipHeadingText,
					} ) }
					borderless
					recordClick={ () => recordClick( 'forward' ) }
				/>
			</div>
		);
	}

	function renderNextButton() {
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

	const classes = clsx( 'step-container', className, flowName, stepName, {
		'is-horizontal-layout': isHorizontalLayout,
		'is-wide-layout': isWideLayout,
		'is-full-layout': isFullLayout,
		'is-large-skip-layout': isLargeSkipLayout,
		'has-navigation': ! shouldHideNavButtons,
		'is-extra-wide-layout': isExtraWideLayout,
	} );

	return (
		<div className={ classes }>
			<ActionButtons
				className={ clsx( 'step-container__navigation', {
					'should-hide-nav-buttons': shouldHideNavButtons,
					'has-sticky-nav-buttons-padding': hasStickyNavButtonsPadding,
				} ) }
			>
				{ ! hideBack && renderBackButton() }
				{ ! hideSkip && skipButtonAlign === 'top' && renderSkipButton() }
				{ ! hideNext && renderNextButton() }
				{ customizedActionButtons }
			</ActionButtons>
			{ ! hideFormattedHeader && (
				<div className="step-container__header">
					{ notice }
					{ formattedHeader }
					{ headerImageUrl && (
						<div className="step-container__header-image">
							<img src={ headerImageUrl } alt="" />
						</div>
					) }
					{ headerButton && <div className="step-container__header-button">{ headerButton }</div> }
					{ showHeaderJetpackPowered && (
						<div className="step-container__header-jetpack-powered">
							<JetpackLogo monochrome size={ 18 } /> <span>{ translate( 'Jetpack powered' ) }</span>
						</div>
					) }
					{ showHeaderWooCommercePowered && (
						<div className="step-container__header-woocommerce-powered">
							<WooCommerceWooLogo /> <span>{ translate( 'WooCommerce powered' ) }</span>
						</div>
					) }
				</div>
			) }

			<div className="step-container__content">{ stepContent }</div>

			{ ! hideSkip && skipButtonAlign === 'bottom' && (
				<div className="step-container__buttons">
					{ isLargeSkipLayout && <hr className="step-container__skip-hr" /> }
					{ renderSkipButton() }
				</div>
			) }
			{ showJetpackPowered && (
				<div className="step-container__jetpack-powered">
					<JetpackLogo monochrome size={ 18 } /> <span>{ translate( 'Jetpack powered' ) }</span>
				</div>
			) }

			{ showFooterWooCommercePowered && (
				<div className="step-container__woocommerce-powered">
					<WooCommerceWooLogo /> <span>{ translate( 'WooCommerce powered' ) }</span>
				</div>
			) }
		</div>
	);
};

export default StepContainer;
