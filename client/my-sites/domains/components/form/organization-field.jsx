import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import HiddenInput from './hidden-input';

export class OrganizationField extends PureComponent {
	constructor( props ) {
		super( props );
		this.state = {
			toggled: props.toggled,
		};
	}

	handleToggle = () => {
		this.setState( { toggled: true } );
	};

	render() {
		const { translate } = this.props;
		const shouldShowExplanation = this.state.toggled || this.props.value;

		return (
			<div className="organization-field-container">
				<HiddenInput { ...this.props } onToggle={ this.handleToggle } />
				{ shouldShowExplanation && (
					<span>
						{ translate(
							'The organization, if filled, will be made public and considered the legal domain owner'
						) }
					</span>
				) }
			</div>
		);
	}
}

export default localize( OrganizationField );
