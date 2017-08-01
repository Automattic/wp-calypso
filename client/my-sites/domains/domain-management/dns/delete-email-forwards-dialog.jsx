/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { domainManagementEmailForwarding } from 'my-sites/domains/paths';

class DeleteEmailForwardsDialog extends React.PureComponent {
	static propTypes = {
		onClose: React.PropTypes.func,
		visible: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	};

	closeDeleteForwards = () => {
		this.props.onClose( { shouldDeleteEmailForwards: true } );
	};

	close = () => {
		this.props.onClose( { shouldDeleteEmailForwards: false } );
	};

	render() {
		const { translate, visible } = this.props;

		const buttons = [
			{
				action: 'delete',
				label: translate( 'Deactivate Email Forwards and Remove Records' ),
				isPrimary: true,
				onClick: this.closeDeleteForwards
			},
			{
				action: 'keep',
				label: translate( 'Keep Records and Email Forwards' )
			}
		];

		return (
			<Dialog
					isVisible={ visible }
					buttons={ buttons }
					onClose={ this.close }
					className="cancel-purchase-button__warning-dialog"
			>
				<h1>
					{ translate( 'Are you sure?' ) }
				</h1>
				<p>
				{ translate(
					'Removing this record will delete your current {{a}}Email Forwards{{/a}}.',
					{
						components: {
							a: <a target="_blank" rel="noopener noreferrer"
								href={ this.getEmailForwardingPath() }
							/>
						}
					}
				) }
				</p>
			</Dialog>
		);
	}

	getEmailForwardingPath() {
		return domainManagementEmailForwarding(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		);
	}
}

export default localize( DeleteEmailForwardsDialog );
