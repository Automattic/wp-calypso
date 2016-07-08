/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { domainManagementEmailForwarding } from 'my-sites/upgrades/paths';

const DeleteEmailForwardsDialog = React.createClass( {
	propTypes: {
		onClose: React.PropTypes.func,
		visible: React.PropTypes.bool.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	close( result ) {
		this.props.onClose( result );
	},

	isVisible() {
		return this.props.visible;
	},

	render() {
		const buttons = [
				{
					action: 'delete',
					label: this.translate( 'Deactivate Email Forwards and Remove Records' ),
					isPrimary: true,
					onClick: () => this.close( { shouldDeleteEmailForwards: true } )
				},
				{
					action: 'keep',
					label: this.translate( 'Keep Records and Email Forwards' )
				}
			];

		return (
			<Dialog
					isVisible={ this.isVisible() }
					buttons={ buttons }
					onClose={ () => this.close( { shouldDeleteEmailForwards: false } ) }
					className="cancel-purchase-button__warning-dialog">
				<h1>{ this.translate( 'Are you sure?' ) }</h1>
				<p>
				{ this.translate(
					'Removing this record will delete your current {{a}}Email Forwards{{/a}}.',
					{
						components: {
							a: <a target="_blank" href={ this.getEmailForwardingPath() } />
						}
					}
				) }
				</p>
			</Dialog>
		);
	},

	getEmailForwardingPath: function() {
		return domainManagementEmailForwarding(
			this.props.selectedSite.slug,
			this.props.selectedDomainName
		);
	}
} );

export default DeleteEmailForwardsDialog;
