import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getSite, isCurrentPlanPaid } from 'calypso/state/sites/selectors';

class TransferConfirmationDialog extends PureComponent {
	static propTypes = {
		disableDialogButtons: PropTypes.bool.isRequired,
		domain: PropTypes.object.isRequired,
		isMapping: PropTypes.bool.isRequired,
		isVisible: PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired,
		onConfirmTransfer: PropTypes.func.isRequired,
		primaryWithPlansOnly: PropTypes.bool,
		targetSiteId: PropTypes.number.isRequired,
	};

	onConfirm = ( closeDialog ) => {
		this.props.onConfirmTransfer( this.props.targetSite, closeDialog );
	};

	getMessage() {
		const { domain, isMapping, targetSite, translate } = this.props;
		const targetSiteTitle = targetSite?.title || translate( 'Site Title' );

		if ( isMapping ) {
			return translate(
				'Do you want to transfer domain connection of {{strong}}%(domainName)s{{/strong}} ' +
					'to site {{strong}}%(targetSiteTitle)s{{/strong}}?',
				{
					args: { domainName: domain.name, targetSiteTitle },
					components: { strong: <strong /> },
				}
			);
		}

		return translate(
			'Do you want to attach {{strong}}%(domainName)s{{/strong}} ' +
				'to site {{strong}}%(targetSiteTitle)s{{/strong}}?',
			{
				args: { domainName: domain.name, targetSiteTitle },
				components: { strong: <strong /> },
			}
		);
	}

	renderTargetSiteOnFreePlanWarnings() {
		const { isMapping } = this.props;

		if ( isMapping ) {
			return this.props.primaryWithPlansOnly ? (
				<p>
					{ this.props.translate(
						"The target site doesn't have a paid plan, so you'll have to pay the full price for a " +
							'domain connection subscription when the domain connection next renews. You will not be able to set it as primary either. ' +
							'If you upgrade the target site to a paid plan, these features are included in the plan.'
					) }
				</p>
			) : (
				<p>
					{ this.props.translate(
						"The target site doesn't have a paid plan, so you'll have to pay the full price for a " +
							'domain connection subscription when the domain connection next renews. ' +
							'If you upgrade the target site to a paid plan, domain connections (and many more features!) are included in our plans.'
					) }
				</p>
			);
		}
		return this.props.primaryWithPlansOnly ? (
			<p>
				{ this.props.translate(
					"The target site doesn't have a paid plan, so you won't be able to set this domain as primary on the site."
				) }
			</p>
		) : null;
	}

	renderEmailSubscriptionInformation() {
		const { domain, translate } = this.props;

		return (
			<p>
				{ translate(
					'The email subscription for %(domainName)s will be transferred along with the domain.',
					{ args: { domainName: domain.name } }
				) }
			</p>
		);
	}

	render() {
		const { domain, isMapping, translate } = this.props;
		const actionLabel = ! isMapping
			? translate( 'Confirm Attachment' )
			: translate( 'Confirm Domain Connection Transfer' );
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
				disabled: this.props.disableDialogButtons,
			},
			{
				action: 'confirm',
				label: actionLabel,
				onClick: this.onConfirm,
				disabled: this.props.disableDialogButtons,
				isPrimary: true,
			},
		];

		const hasEmailWithUs = hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain );

		return (
			<Dialog isVisible={ this.props.isVisible } buttons={ buttons } onClose={ this.props.onClose }>
				<h1>
					{ ! isMapping ? translate( 'Confirm Attachment' ) : translate( 'Confirm Connection' ) }
				</h1>
				<p>{ this.getMessage() }</p>
				{ hasEmailWithUs && this.renderEmailSubscriptionInformation() }
				{ ! this.props.isTargetSiteOnPaidPlan && this.renderTargetSiteOnFreePlanWarnings() }
			</Dialog>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	targetSite: getSite( state, ownProps.targetSiteId ),
	isTargetSiteOnPaidPlan: isCurrentPlanPaid( state, ownProps.targetSiteId ),
	primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
} ) )( localize( TransferConfirmationDialog ) );
