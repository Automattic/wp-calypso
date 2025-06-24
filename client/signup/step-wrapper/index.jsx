import { ActionButtons } from '@automattic/onboarding';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import flows from 'calypso/signup/config/flows';
import NavigationLink from 'calypso/signup/navigation-link';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import HelpCenterStepButton from '../help-center-step-button';
import './style.scss';

class StepWrapper extends Component {
	static propTypes = {
		shouldHideNavButtons: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		hideFormattedHeader: PropTypes.bool,
		headerImageUrl: PropTypes.string,
		hideBack: PropTypes.bool,
		hideSkip: PropTypes.bool,
		hideNext: PropTypes.bool,
		isSticky: PropTypes.bool,
		// Allows to force a back button in the first step for example.
		// You should only force this when you're passing a backUrl.
		allowBackFirstStep: PropTypes.bool,
		skipLabelText: PropTypes.string,
		skipHeadingText: PropTypes.string,
		skipButtonAlign: PropTypes.oneOf( [ 'top', 'bottom' ] ),
		nextLabelText: PropTypes.string,
		// Displays an <hr> above the skip button and adds more white space
		isLargeSkipLayout: PropTypes.bool,
		isExternalBackUrl: PropTypes.bool,
		headerButton: PropTypes.node,
		isWideLayout: PropTypes.bool,
		isFullLayout: PropTypes.bool,
		isHorizontalLayout: PropTypes.bool,
		queryParams: PropTypes.object,
		customizedActionButtons: PropTypes.element,
		userLoggedIn: PropTypes.bool,
	};

	static defaultProps = {
		allowBackFirstStep: false,
		skipButtonAlign: 'bottom',
		hideNext: true,
	};

	renderBack() {
		if ( this.props.shouldHideNavButtons ) {
			return null;
		}
		return (
			<NavigationLink
				direction="back"
				goToPreviousStep={ this.props.goToPreviousStep }
				flowName={ this.props.flowName }
				positionInFlow={ this.props.positionInFlow }
				stepName={ this.props.stepName }
				stepSectionName={ this.props.stepSectionName }
				backUrl={ this.props.backUrl }
				rel={ this.props.isExternalBackUrl ? 'external' : '' }
				labelText={ this.props.backLabelText }
				allowBackFirstStep={ this.props.allowBackFirstStep || !! this.props.backUrl }
				backIcon="chevron-left"
				queryParams={ this.props.queryParams }
			/>
		);
	}

	renderSkip( { borderless, forwardIcon } ) {
		const {
			shouldHideNavButtons,
			skipHeadingText,
			skipLabelText,
			defaultDependencies,
			flowName,
			stepName,
			goToNextStep,
		} = this.props;

		if ( shouldHideNavButtons || ! goToNextStep ) {
			return null;
		}

		return (
			<div className="step-wrapper__skip-wrapper">
				{ skipHeadingText && <div className="step-wrapper__skip-heading">{ skipHeadingText }</div> }
				<NavigationLink
					direction="forward"
					goToNextStep={ goToNextStep }
					defaultDependencies={ defaultDependencies }
					flowName={ flowName }
					stepName={ stepName }
					labelText={ skipLabelText }
					cssClass={ clsx( 'step-wrapper__navigation-link', 'has-underline', {
						'has-skip-heading': skipHeadingText,
					} ) }
					borderless={ borderless }
					forwardIcon={ forwardIcon }
				/>
			</div>
		);
	}

	renderNext() {
		const {
			shouldHideNavButtons,
			nextLabelText,
			defaultDependencies,
			flowName,
			stepName,
			forwardUrl,
			goToNextStep,
			translate,
		} = this.props;

		if ( shouldHideNavButtons || ! goToNextStep ) {
			return null;
		}

		return (
			<NavigationLink
				direction="forward"
				goToNextStep={ goToNextStep }
				forwardUrl={ forwardUrl }
				defaultDependencies={ defaultDependencies }
				flowName={ flowName }
				stepName={ stepName }
				labelText={ nextLabelText || translate( 'Continue' ) }
				cssClass="step-wrapper__navigation-link"
				borderless={ false }
				primary
				forwardIcon={ null }
				disabledTracksOnClick
			/>
		);
	}

	headerText() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.headerText !== undefined ) {
				return this.props.headerText;
			}

			return this.props.translate( 'Let’s get started' );
		}

		if ( this.props.fallbackHeaderText !== undefined ) {
			return this.props.fallbackHeaderText;
		}
	}

	subHeaderText() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.subHeaderText !== undefined ) {
				return this.props.subHeaderText;
			}

			return this.props.translate( 'Welcome to the best place for your WordPress website.' );
		}

		if ( this.props.fallbackSubHeaderText !== undefined ) {
			return this.props.fallbackSubHeaderText;
		}
	}

	render() {
		const {
			flowName,
			stepContent,
			headerButton,
			headerContent,
			hideFormattedHeader,
			hideBack,
			hideSkip,
			hideNext,
			isLargeSkipLayout,
			isWideLayout,
			isFullLayout,
			skipButtonAlign,
			align,
			headerImageUrl,
			isHorizontalLayout,
			customizedActionButtons,
			isExtraWideLayout,
			isSticky,
			userLoggedIn,
		} = this.props;

		const backButton = ! hideBack && this.renderBack();
		const skipButton =
			! hideSkip &&
			skipButtonAlign === 'top' &&
			this.renderSkip( { borderless: true, forwardIcon: null } );
		const nextButton = ! hideNext && this.renderNext();
		const hasNavigation = backButton || skipButton || nextButton || customizedActionButtons;
		const classes = clsx( 'step-wrapper', this.props.className, {
			'is-horizontal-layout': isHorizontalLayout,
			'is-wide-layout': isWideLayout,
			'is-extra-wide-layout': isExtraWideLayout,
			'is-full-layout': isFullLayout,
			'is-large-skip-layout': isLargeSkipLayout,
			'has-navigation': hasNavigation,
		} );

		const flow = flows.getFlow( flowName, userLoggedIn );

		let sticky = null;
		if ( isSticky !== undefined ) {
			sticky = isSticky;
		}

		const isHelpCenterLinkEnabled = flow?.enabledHelpCenterLocales && userLoggedIn;

		return (
			<>
				<div className={ classes }>
					<ActionButtons className="step-wrapper__navigation" sticky={ sticky }>
						{ backButton }
						{ skipButton }
						{ nextButton }
						{ customizedActionButtons }
						{ isHelpCenterLinkEnabled && (
							<HelpCenterStepButton
								flowName={ flowName }
								enabledLocales={ flow?.enabledHelpCenterLocales }
								helpCenterButtonCopy={ flow?.helpCenterButtonCopy }
								helpCenterButtonLink={ flow?.helpCenterButtonLink }
							/>
						) }
					</ActionButtons>
					{ ! hideFormattedHeader && (
						<div className="step-wrapper__header">
							<FormattedHeader
								id="step-header"
								headerText={ this.headerText() }
								subHeaderText={ this.subHeaderText() }
								align={ align }
								brandFont
							/>
							{ headerImageUrl && (
								<div className="step-wrapper__header-image">
									<img src={ headerImageUrl } alt="" />
								</div>
							) }

							{ headerContent && (
								<div className="step-wrapper__header-content">{ headerContent }</div>
							) }
							{ headerButton && (
								<div className="step-wrapper__header-button">{ headerButton }</div>
							) }
						</div>
					) }

					<div className="step-wrapper__content">{ stepContent }</div>

					{ ! hideSkip && skipButtonAlign === 'bottom' && (
						<div className="step-wrapper__buttons">
							{ isLargeSkipLayout && <hr className="step-wrapper__skip-hr" /> }
							{ this.renderSkip( { borderless: true } ) }
						</div>
					) }
				</div>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const backToParam = getCurrentQueryArguments( state )?.back_to?.toString();
	const backTo = backToParam?.startsWith( '/' ) ? backToParam : undefined;

	let backUrl = ownProps.backUrl;

	// Fallback to back_to from the query string only if the current step is the first step.
	if ( ! backUrl && ownProps.positionInFlow === 0 ) {
		backUrl = backTo;
	}

	return {
		backUrl,
		userLoggedIn: isUserLoggedIn( state ),
	};
} )( localize( StepWrapper ) );
