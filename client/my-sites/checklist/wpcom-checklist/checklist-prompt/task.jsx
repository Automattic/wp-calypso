/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ChecklistPromptTask extends PureComponent {
	static propTypes = {
		buttonText: PropTypes.node,
		completed: PropTypes.bool,
		description: PropTypes.node,
		onClick: PropTypes.func,
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		// Prompts never render completed Tasks
		if ( this.props.completed ) {
			return null;
		}

		const { description, onClick, title, translate } = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;

		return (
			<>
				<div className="checklist-prompt__content">
					<h3 className="checklist-prompt__title">{ title }</h3>
					<p className="checklist-prompt__description">{ description }</p>
					<div className="checklist-prompt__actions">
						{ onClick && (
							<Button onClick={ onClick } className="checklist-prompt__button" primary>
								{ buttonText }
							</Button>
						) }
					</div>
				</div>
			</>
		);
	}
}

export default localize( ChecklistPromptTask );
