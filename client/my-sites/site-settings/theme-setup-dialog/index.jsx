/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import PulsingDot from 'components/pulsing-dot';
import { getSelectedSite } from 'state/ui/selectors';
import { closeDialog } from 'state/ui/theme-setup/actions';

class ThemeSetupDialog extends React.Component {
	constructor( { isDialogVisible, saveExisting, site, onClose, translate } ) {
		super();
		this.isDialogVisible = isDialogVisible;
		this.saveExisting = saveExisting;
		this.site = site;
		this.translate = translate.bind( this );
		// this.onInputChange = this.onInputChange.bind( this );
		// this.onClickDeleteContent = this.onClickDeleteContent.bind( this );
		// this.onClickKeepContent = this.onClickKeepContent.bind( this );
		this.onClose = onClose.bind( this );
		this.state = {
			confirmInput: '',
			confirmInputError: true,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.isDialogVisible !== nextProps.isDialogVisible ) {
			this.isDialogVisible = nextProps.isDialogVisible;
		}
		if ( this.saveExisting !== nextProps.saveExisting ) {
			this.saveExisting = nextProps.saveExisting;
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

	renderButtons() {
		const cancel = { action: 'cancel', label: this.translate( 'Cancel' ) };
		const deleteContent = (
			<Button
				primary
				scary
				disabled={ this.state.confirmInputError }
				onClick={ this.onClickDeleteContent }>
				{ this.translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const keepContent = (
			<Button
				primary
				onClick={ this.onClickKeepContent }>
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
		if ( this.saveExisting ) {
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
		if ( this.saveExisting ) {
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

	render() {
		return (
			<Dialog className="theme-setup-dialog"
				isVisible={ this.isDialogVisible }
				buttons={ this.renderButtons() }
				onClose={ this.onClose }>
				{ this.state.isSettingUpTheme
					? this.renderLoading()
					: this.renderContent() }
			</Dialog>
		);
	}
}

ThemeSetupDialog = localize( ThemeSetupDialog );

const mapStateToProps = ( state ) => {
	const isDialogVisible = state.ui.themeSetup.isDialogVisible;
	const saveExisting = state.ui.themeSetup.saveExisting;
	const site = getSelectedSite( state );
	return {
		isDialogVisible,
		saveExisting,
		site,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	const onClose = () => {
		dispatch( closeDialog() );
	};
	return {
		onClose,
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( ThemeSetupDialog );

