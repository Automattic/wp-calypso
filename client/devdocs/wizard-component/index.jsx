/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import Wizard from 'components/wizard/docs/example';

class WizardComponent extends Component {
	backToComponents = () => page( '/devdocs/design/' );

	render() {
		const { stepName } = this.props;

		return (
			<Main className="wizard-component">
				<HeaderCake onClick={ this.backToComponents } backText="All Components">
					Wizard
				</HeaderCake>
				<Wizard stepName={ stepName } />
			</Main>
		);
	}
}

export default WizardComponent;
