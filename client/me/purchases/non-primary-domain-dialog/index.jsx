import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

import './style.scss';

class NonPrimaryDomainDialog extends Component {
	static propTypes = {
		planName: PropTypes.string.isRequired,
		oldDomainName: PropTypes.string.isRequired,
		newDomainName: PropTypes.string.isRequired,
		hasSetupAds: PropTypes.bool,
	};

	close = () => {
		this.props.closeDialog();
	};

	removePlan = () => {
		this.props.removePlan();
	};

	render() {
		const { planName, oldDomainName, newDomainName, translate, hasSetupAds } = this.props;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Keep plan' ),
			},
			{
				action: 'remove',
				isPrimary: true,
				label: translate( 'Remove plan' ),
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
							'{{strong}}%(newDomain)s{{/strong}} will be the address that people see when they visit your site.',
							{
								args: {
									newDomain: newDomainName,
								},
								components: {
									strong: <strong />,
								},
							}
						) }{ ' ' }
						{ hasSetupAds && (
							<>
								<br />
								<br />
								{ translate(
									'You will also be ineligible for the WordAds program. Visit {{a}}our FAQ{{/a}} to learn more.',
									{
										components: {
											a: (
												<a
													href="https://wordads.co/faq/#eligibility-for-wordads"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									}
								) }
								<br />
								<br />
							</>
						) }
						{ translate( 'Would you still like to downgrade your plan?' ) }
					</p>
				</Fragment>
			</Dialog>
		);
	}
}

export default localize( NonPrimaryDomainDialog );
