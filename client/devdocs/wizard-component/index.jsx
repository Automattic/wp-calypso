import page from '@automattic/calypso-router';
import { Component } from 'react';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import ReadmeViewer from 'calypso/components/readme-viewer';
import Wizard from 'calypso/components/wizard/docs/example';

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
				<ReadmeViewer section="design" readmeFilePath="/client/components/wizard/README.md" />
			</Main>
		);
	}
}

export default WizardComponent;
