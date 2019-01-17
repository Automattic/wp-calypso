/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import { hideChecklistPrompt } from 'state/inline-help/actions';

class ChecklistPromptTask extends PureComponent {
	static propTypes = {
		buttonText: PropTypes.string,
		completed: PropTypes.bool,
		description: PropTypes.node,
		duration: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		closePopover: PropTypes.func.isRequired,
		autoCloseOnAction: PropTypes.bool.isRequired,
		canDismiss: PropTypes.bool.isRequired,
		dismissButtonText: PropTypes.string,
		onDismiss: PropTypes.func,
	};

	static defaultProps = {
		canDismiss: true,
		autoCloseOnClick: true,
	};

	handleDismiss = () => {
		if ( this.props.autoCloseOnAction ) {
			this.props.hideChecklistPrompt();
			this.props.closePopover();
		}

		if ( this.props.onDismiss ) {
			this.props.onDismiss();
		}

		this.props.recordTracksEvent( 'calypso_checklist_prompt_dismiss' );
	};

	handlePrimaryAction = () => {
		if ( this.props.autoCloseOnAction ) {
			this.props.hideChecklistPrompt();
			this.props.closePopover();
		}

		if ( this.props.onClick ) {
			this.props.onClick();
		}
	};

	render() {
		const { canDismiss, description, onClick, title, duration, translate } = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;
		const { dismissButtonText = translate( 'Dismiss' ) } = this.props;

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
					{ onClick && (
						<>
							<Button
								onClick={ this.handlePrimaryAction }
								className="checklist-prompt__button"
								primary
							>
								{ buttonText }
							</Button>
							{ canDismiss && (
								<Button onClick={ this.handleDismiss } className="checklist-prompt__button">
									{ dismissButtonText }
								</Button>
							) }
						</>
					) }
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = {
	hideChecklistPrompt,
	recordTracksEvent,
};

export default connect(
	null,
	mapDispatchToProps
)( localize( ChecklistPromptTask ) );
