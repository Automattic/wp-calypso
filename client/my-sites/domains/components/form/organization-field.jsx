import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import HiddenInput from './hidden-input';

export class OrganizationField extends PureComponent {
	constructor( props ) {
		super( props );
		this.state = {
			isToggled: false,
		};
	}

	handleToggle = () => {
		this.setState( { isToggled: true } );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="organization-field-container">
				<HiddenInput { ...this.props } onToggle={ this.handleToggle } />
				{ this.state.isToggled && (
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
