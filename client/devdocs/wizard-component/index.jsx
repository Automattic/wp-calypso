/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import Wizard from 'components/wizard/docs/example';
import ReadmeViewer from 'components/readme-viewer';

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
				<ReadmeViewer section="design" readmeFilePath="components/wizard" />
			</Main>
		);
	}
}

export default WizardComponent;
