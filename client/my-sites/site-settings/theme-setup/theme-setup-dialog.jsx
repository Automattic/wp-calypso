/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';

class ThemeSetupDialog extends React.Component {
	constructor( { isVisible, keepContent, onClose, site, translate } ) {
		super();
		this.onClose = onClose;
		this.site = site;
		this.translate = translate.bind( this );
		this.state = {
			isVisible,
			keepContent,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.state.isVisible !== nextProps.isVisible ) {
			this.setState( {
				isVisible: nextProps.isVisible,
				keepContent: nextProps.keepContent,
			} );
		}
	}

	render() {
		const buttonCancel = { action: 'cancel', label: this.translate( 'Cancel' ) };
		const buttonDeleteContent = (
			<Button
				primary
				scary
				disabled={ true }
				onClick={ () => {} }>
				{ this.translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const buttonKeepContent = (
			<Button
				primary
				onClick={ () => {} }>
				{ this.translate( 'Set Up And Keep Content' ) }
			</Button>
		);
		return (
			<div>
			{ this.state.keepContent ? (
				<Dialog
					isVisible={ this.state.isVisible }
					buttons= { [ buttonCancel, buttonKeepContent ] }
					onClose={ this.onClose }>
					<h1>{ this.translate( 'Confirm Theme Setup' ) }</h1>
					<p>
						{ this.translate( 'Settings will be changed on {{strong}}%(site)s{{/strong}}, but no content will be deleted. These changes will be live immmediately. Do you want to proceed?', {
							components: {
								strong: <strong />,
							},
							args: {
								site: this.site.domain,
							}
						} ) }
					</p>
				</Dialog>
			) : (
				<Dialog
					isVisible={ this.state.isVisible }
					buttons= { [ buttonCancel, buttonDeleteContent ] }
					onClose={ this.onClose }>
					<h1>{ this.translate( 'Confirm Theme Setup' ) }</h1>
					<p>
						{ this.translate( 'Please type in {{warn}}delete{{/warn}} in the field below to confirm. {{strong}}All content on %(site)s will be deleted{{/strong}}, and then your site will be set up. These changes will be live immediately.', {
							components: {
								warn: <span className="theme-setup-dialog__confirm-text"/>,
								strong: <strong />,
							},
							args: {
								site: this.site.domain,
							},
						} ) }
					</p>
				</Dialog>
			) }
		</div>
		);
	}
}

export default localize( ThemeSetupDialog );
