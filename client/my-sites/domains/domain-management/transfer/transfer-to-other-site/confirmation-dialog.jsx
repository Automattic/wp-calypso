import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getSite, isCurrentPlanPaid } from 'calypso/state/sites/selectors';

class TransferConfirmationDialog extends PureComponent {
	static propTypes = {
		isMapping: PropTypes.bool.isRequired,
		isVisible: PropTypes.bool.isRequired,
		targetSiteId: PropTypes.number.isRequired,
		disableDialogButtons: PropTypes.bool.isRequired,
		domainName: PropTypes.string.isRequired,
		onConfirmTransfer: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		primaryWithPlansOnly: PropTypes.bool,
	};

	onConfirm = ( closeDialog ) => {
		this.props.onConfirmTransfer( this.props.targetSite, closeDialog );
	};

	getMessage() {
		const { domainName, isMapping, targetSite, translate } = this.props;
		const targetSiteTitle = get( targetSite, 'title', translate( 'Site Title' ) );
		if ( isMapping ) {
			return translate(
				'Do you want to transfer domain connection of {{strong}}%(domainName)s{{/strong}} ' +
					'to site {{strong}}%(targetSiteTitle)s{{/strong}}?',
				{
					args: { domainName, targetSiteTitle },
					components: { strong: <strong /> },
				}
			);
		}

		return translate(
			'Do you want to transfer {{strong}}%(domainName)s{{/strong}} ' +
				'to site {{strong}}%(targetSiteTitle)s{{/strong}}?',
			{
				args: { domainName, targetSiteTitle },
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

	render() {
		const { isMapping, translate } = this.props;
		const actionLabel = ! isMapping
			? translate( 'Confirm Transfer' )
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

		return (
			<Dialog isVisible={ this.props.isVisible } buttons={ buttons } onClose={ this.props.onClose }>
				<h1>{ translate( 'Confirm Transfer' ) }</h1>
				<p>{ this.getMessage() }</p>
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
