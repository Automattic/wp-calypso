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
import PulsingDot from 'components/pulsing-dot';

class ThemeSetupDialog extends React.Component {
	constructor( { isVisible, keepContent, site, translate } ) {
		super();
		this.site = site;
		this.translate = translate.bind( this );
		this.onInputChange = this.onInputChange.bind( this );
		this.onClick = this.onClick.bind( this );
		this.onClose = this.onClose.bind( this );
		this.state = {
			isVisible,
			keepContent,
			confirmInput: '',
			confirmInputError: true,
			isSettingUpTheme: false,
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

	onClick() {
		this.setState( {
			isSettingUpTheme: true,
		} );
	}

	renderButtons() {
		const cancel = { action: 'cancel', label: this.translate( 'Cancel' ) };
		const deleteContent = (
			<Button
				primary
				scary
				disabled={ this.state.confirmInputError }
				onClick={ this.onClick }>
				{ this.translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const keepContent = (
			<Button
				primary
				onClick={ this.onClick }>
				{ this.translate( 'Set Up And Keep Content' ) }
			</Button>
		);
		const backToSetup = (
			<Button
				disabled={ this.state.isSettingUpTheme }
				onClick={ this.onClick }>
				{ this.translate( 'Back To Setup' ) }
			</Button>
		);
		const viewSite = (
			<Button
				primary
				disabled={ this.state.isSettingUpTheme }
				onClick={ this.onClick }>
				{ this.translate( 'View Site' ) }
			</Button>
		);

		if ( this.state.isSettingUpTheme ) {
			return [
				backToSetup,
				viewSite
			];
		}
		if ( this.state.keepContent ) {
			return [
				cancel,
				keepContent,
			];
		} else {
			return [
				cancel,
				deleteContent,
			];
		}
	}

	renderLoading() {
		return (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
	}

	renderContent() {
		if ( this.state.keepContent ) {
			return (
				<div>
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
				</div>
			);
		} else {
			return (
				<div>
					<h1>{ this.translate( 'Confirm Theme Setup' ) }</h1>
					<p>
						{ this.translate( 'Please type {{warn}}delete{{/warn}} into the field below to confirm. {{strong}}All content on %(site)s will be deleted{{/strong}}, and then your site will be set up. These changes will be live immediately.', {
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
							value={ this.state.confirmInput } />
						<FormInputValidation
							isError={ this.state.confirmInputError }
							text={ this.state.confirmInputError
								? this.translate( 'Text does not match.' )
								: this.translate( 'Text matches.' ) } />
					</FormFieldset>
				</div>
			);
		}
	}

	onClose() {
		this.setState( {
			isVisible: false,
		} );
	}

	render() {
		return (
			<Dialog className="theme-setup-dialog"
				isVisible={ this.state.isVisible }
				buttons={ this.renderButtons() }
				onClose={ this.onClose }>
				{ this.state.isSettingUpTheme
					? this.renderLoading()
					: this.renderContent() }
			</Dialog>
		);
	}
}

export default localize( ThemeSetupDialog );
