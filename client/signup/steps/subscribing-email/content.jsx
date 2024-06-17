import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';

class SubscribingEmailStepContent extends PureComponent {
	render() {
		return (
			<div className="subscribing-email__button-wrapper">
				<Button
					primary
					type="submit"
					onClick={ this.props.onButtonClick }
					className="subscribing-email__button"
				>
					Create new user
				</Button>
			</div>
		);
	}
}

export default localize( SubscribingEmailStepContent );
