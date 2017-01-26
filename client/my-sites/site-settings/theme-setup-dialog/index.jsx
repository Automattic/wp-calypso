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
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';

class ThemeSetupDialog extends React.Component {
	constructor( { isVisible, keepContent, onClose, site, translate } ) {
		super();
		this.onClose = onClose;
		this.site = site;
		this.translate = translate.bind( this );
		this.onInputChange = this.onInputChange.bind( this );
		this.state = {
			isVisible,
			keepContent,
			confirmInput: '',
			confirmInputError: true,
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

	onInputChange( event ) {
		this.setState( {
			confirmInput: event.target.value,
			confirmInputError: true,
		} );
		if ( 'delete' === event.target.value ) {
			this.setState( {
				confirmInputError: false,
			} );
		}
	}

	render() {
		const buttonCancel = { action: 'cancel', label: this.translate( 'Cancel' ) };
		const buttonDeleteContent = (
			<Button
				primary
				scary
				disabled={ this.state.confirmInputError }
				onClick={ () => { null } }>
				{ this.translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const buttonKeepContent = (
			<Button
				primary
				onClick={ () => { null } }>
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
					<FormFieldset>
						<FormTextInput
							autoCapitalize={ false }
							autoComplete={ false }
							autoCorrect={ false }
							onChange={ this.onInputChange }
							value={ this.state.confirmInput }/>
						<FormInputValidation
							isError={ this.state.confirmInputError }
							text={ this.state.confirmInputError
								? this.translate( 'Text does not match.' )
								: this.translate( 'Text matches.' ) } />
					</FormFieldset>
				</Dialog>
			) }
		</div>
		);
	}
}

export default localize( ThemeSetupDialog );
