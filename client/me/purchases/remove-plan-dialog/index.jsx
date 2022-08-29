import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

import './style.scss';

class RemovePlanDialog extends Component {
	static propTypes = {
		planName: PropTypes.string.isRequired,
	};

	close = () => {
		this.props.closeDialog();
	};

	removePlan = () => {
		this.props.removePlan();
	};

	render() {
		const { planName, translate } = this.props;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'remove',
				isPrimary: true,
				label: translate( 'Remove Plan' ),
				onClick: this.removePlan,
			},
		];

		return (
			<Dialog
				buttons={ buttons }
				className="remove-plan-dialog"
				isVisible={ this.props.isDialogVisible }
				onClose={ this.close }
			>
				<Fragment>
					<FormSectionHeading>
						{ translate( 'New cancel flow - Remove plan: %(plan)s', {
							args: { plan: planName },
						} ) }
					</FormSectionHeading>

					<p>
						{ translate( 'Dialog content' ) }
						<br />
					</p>
				</Fragment>
			</Dialog>
		);
	}
}

export default localize( RemovePlanDialog );
