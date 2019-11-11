/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	hideChecklistPrompt,
	setChecklistPromptTaskId,
	setChecklistPromptStep,
} from 'state/inline-help/actions';
import { getChecklistPromptStep } from 'state/inline-help/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';

class ChecklistPromptTask extends PureComponent {
	static propTypes = {
		preset: PropTypes.oneOf( [ 'update-homepage' ] ),
		buttonText: PropTypes.string,
		completed: PropTypes.bool,
		description: PropTypes.node,
		duration: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		closePopover: PropTypes.func.isRequired,
		onDismiss: PropTypes.func,
		trackTaskDisplay: PropTypes.func,
	};

	static defaultProps = {
		trackTaskDisplay: () => {},
	};

	componentDidMount() {
		const { currentRoute, targetUrl } = this.props;

		if ( currentRoute !== targetUrl ) {
			page( targetUrl );
		}

		this.props.trackTaskDisplay( this.props.id, this.props.completed, 'prompt' );
	}

	getExtendedProps() {
		const { preset, translate } = this.props;
		let stepProps = null;

		if ( preset === 'update-homepage' ) {
			stepProps = this.getUpdateHomepageProps();
		}

		return {
			buttonText: translate( 'Do it!' ),
			secondaryButtonText: translate( 'Dismiss' ),
			handlePrimaryAction: this.goToAction,
			handleSecondaryAction: this.dismissPopup,
			...this.props,
			...stepProps,
		};
	}

	getUpdateHomepageProps() {
		const { steps, currentStep, title, description, translate } = this.props;

		if ( currentStep === 0 ) {
			return {
				handlePrimaryAction: this.progressTaskStep,
				handleSecondaryAction: this.dismissTaskAndSkipToEnd,
				secondaryButtonText: translate( 'Mark complete' ),
			};
		}

		if ( currentStep === 1 ) {
			return {
				title: get( steps, [ currentStep - 1, 'title' ], title ),
				description: get( steps, [ currentStep - 1, 'description' ], description ),
				buttonText: translate( 'Done editing' ),
				handlePrimaryAction: this.dismissTaskAndSkipToEnd,
				secondaryButtonText: translate( 'Keep editing' ),
				handleSecondaryAction: this.dismissPopup,
				duration: null,
			};
		}

		if ( currentStep === 2 ) {
			return {
				title: get( steps, [ currentStep - 1, 'title' ], title ),
				description: get( steps, [ currentStep - 1, 'description' ], description ),
				buttonText: translate( 'Next task' ),
				handlePrimaryAction: this.props.nextInlineHelp,
				secondaryButtonText: translate( 'View all tasks' ),
				handleSecondaryAction: this.backToChecklistAndClose,
				duration: null,
			};
		}
	}

	dismissPopup = () => {
		this.props.hideChecklistPrompt();
		this.props.closePopover();
		this.props.recordTracksEvent( 'calypso_checklist_prompt_dismiss' );
	};

	goToAction = () => {
		this.props.onClick();
		this.props.closePopover();
	};

	progressTaskStep = () => {
		this.props.setChecklistPromptStep( this.props.currentStep + 1 );
	};

	dismissTaskAndSkipToEnd = () => {
		this.props.onDismiss();
		this.props.setChecklistPromptStep( this.props.steps.length );
	};

	backToChecklistAndClose = () => {
		this.props.hideChecklistPrompt();
		this.props.setChecklistPromptTaskId( null );
		this.props.closePopover();
		this.props.backToChecklist();
	};

	render() {
		const {
			description,
			handlePrimaryAction,
			handleSecondaryAction,
			title,
			duration,
			translate,
			buttonText,
			secondaryButtonText,
		} = this.getExtendedProps();

		return (
			<div className="checklist-prompt__content">
				<h3 className="checklist-prompt__title">{ title }</h3>
				<div className="checklist-prompt__description">{ description }</div>
				{ duration && (
					<div className="checklist-prompt__duration">
						{ translate( 'Estimated time:' ) } { duration }
					</div>
				) }
				<div className="checklist-prompt__actions">
					{ handlePrimaryAction && (
						<>
							<Button onClick={ handlePrimaryAction } className="checklist-prompt__button" primary>
								{ buttonText }
							</Button>
							<Button onClick={ handleSecondaryAction } className="checklist-prompt__button">
								{ secondaryButtonText }
							</Button>
						</>
					) }
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = {
	hideChecklistPrompt,
	setChecklistPromptTaskId,
	setChecklistPromptStep,
	recordTracksEvent,
};

export default connect(
	state => ( {
		currentRoute: getCurrentRoute( state ),
		currentStep: getChecklistPromptStep( state ),
	} ),
	mapDispatchToProps
)( localize( ChecklistPromptTask ) );
