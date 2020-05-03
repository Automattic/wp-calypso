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
import { getSite } from 'state/sites/selectors';
import { Dialog } from '@automattic/components';

class TransferConfirmationDialog extends React.PureComponent {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		targetSiteId: PropTypes.number.isRequired,
		disableDialogButtons: PropTypes.bool.isRequired,
		domainName: PropTypes.string.isRequired,
		onConfirmTransfer: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	};

	onConfirm = ( closeDialog ) => {
		this.props.onConfirmTransfer( this.props.targetSite, closeDialog );
	};

	render() {
		const { domainName, translate } = this.props;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
				disabled: this.props.disableDialogButtons,
			},
			{
				action: 'confirm',
				label: translate( 'Confirm Transfer' ),
				onClick: this.onConfirm,
				disabled: this.props.disableDialogButtons,
				isPrimary: true,
			},
		];

		const targetSiteTitle = get( this.props.targetSite, 'title', '' );

		return (
			<Dialog isVisible={ this.props.isVisible } buttons={ buttons } onClose={ this.props.onClose }>
				<h1>{ translate( 'Confirm Transfer' ) }</h1>
				<p>
					{ translate(
						'Do you want to transfer {{strong}}%(domainName)s{{/strong}} ' +
							'to site {{strong}}%(targetSiteTitle)s{{/strong}}?',
						{
							args: { domainName, targetSiteTitle },
							components: { strong: <strong /> },
						}
					) }
				</p>
			</Dialog>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	targetSite: getSite( state, ownProps.targetSiteId ),
} ) )( localize( TransferConfirmationDialog ) );
