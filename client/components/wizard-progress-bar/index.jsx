import { Button, CompactCard, ProgressBar } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

const noop = () => {};

class WizardProgressBar extends Component {
	static propTypes = {
		currentStep: PropTypes.number.isRequired,
		nextButtonClick: PropTypes.func,
		nextButtonText: PropTypes.string,
		numberOfSteps: PropTypes.number.isRequired,
		previousButtonClick: PropTypes.func,
		previousButtonText: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		nextButtonClick: noop,
		previousButtonClick: noop,
	};

	renderNextButton() {
		const text = this.props.nextButtonText || this.props.translate( 'Next' );

		return (
			<Button primary onClick={ this.props.nextButtonClick }>
				{ text }
			</Button>
		);
	}

	renderPreviousButton() {
		const text = this.props.previousButtonText || this.props.translate( 'Back' );

		return <Button onClick={ this.props.previousButtonClick }>{ text }</Button>;
	}

	render() {
		return (
			<CompactCard className="wizard-progress-bar">
				{ this.renderPreviousButton() }

				<ProgressBar
					value={ this.props.currentStep }
					total={ this.props.numberOfSteps }
					canGoBackwards
				/>

				{ this.renderNextButton() }
			</CompactCard>
		);
	}
}

export default localize( WizardProgressBar );
