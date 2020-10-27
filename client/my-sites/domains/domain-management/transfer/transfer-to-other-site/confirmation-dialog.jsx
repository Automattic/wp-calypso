/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getSite, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { Dialog } from '@automattic/components';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';

class TransferConfirmationDialog extends React.PureComponent {
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
				'Do you want to transfer mapping of {{strong}}%(domainName)s{{/strong}} ' +
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

	render() {
		const { isMapping, translate } = this.props;
		const actionLabel = ! isMapping
			? translate( 'Confirm Transfer' )
			: translate( 'Confirm Mapping Transfer' );
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
				<p>
					{ this.props.primaryWithPlansOnly &&
						! this.props.isTargetSiteOnPaidPlan &&
						translate(
							"The target site is not a paid plan, so you'll have to pay the full price for the domain mapping subscription on renewal. " +
								'Consider upgrading the site to a paid plan to have the mapping for free.'
						) }
				</p>
			</Dialog>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	targetSite: getSite( state, ownProps.targetSiteId ),
	isTargetSiteOnPaidPlan: isCurrentPlanPaid( state, ownProps.targetSiteId ),
	primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
} ) )( localize( TransferConfirmationDialog ) );
