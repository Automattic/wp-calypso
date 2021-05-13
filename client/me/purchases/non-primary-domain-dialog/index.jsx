/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

/**
 * Style dependencies
 */
import './style.scss';

class NonPrimaryDomainDialog extends Component {
	static propTypes = {
		planName: PropTypes.string.isRequired,
		oldDomainName: PropTypes.string.isRequired,
		newDomainName: PropTypes.string.isRequired,
	};

	close = () => {
		this.props.closeDialog();
	};

	removePlan = () => {
		this.props.removePlan();
	};

	render() {
		const { planName, oldDomainName, newDomainName, translate } = this.props;
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
				className="non-primary-domain-dialog"
				isVisible={ this.props.isDialogVisible }
				onClose={ this.close }
			>
				<Fragment>
					<FormSectionHeading>
						{ translate( 'Remove %(plan)s', {
							args: { plan: planName },
						} ) }
					</FormSectionHeading>

					<p>
						{ translate(
							'When you downgrade your plan, {{strong}}%(oldDomain)s{{/strong}} will immediately start ' +
								'forwarding to {{strong}}%(newDomain)s{{/strong}}.',
							{
								args: {
									oldDomain: oldDomainName,
									newDomain: newDomainName,
								},
								components: {
									strong: <strong />,
								},
							}
						) }
						<br />
						{ translate(
							'{{strong}}%(newDomain)s{{/strong}} will be the address that people see when they visit ' +
								'your site. Would you still like to downgrade your plan?',
							{
								args: {
									newDomain: newDomainName,
								},
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
				</Fragment>
			</Dialog>
		);
	}
}

export default localize( NonPrimaryDomainDialog );
