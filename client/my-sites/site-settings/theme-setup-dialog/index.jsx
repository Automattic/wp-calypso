/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

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
import { closeDialog, runThemeSetup } from 'state/ui/theme-setup/actions';

class ThemeSetupDialog extends React.Component {
	constructor( props ) {
		super( props );
		this.onInputChange = this.onInputChange.bind( this );
		this.renderContent = this.renderContent.bind( this );
		this.state = {
			confirmInput: '',
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isDialogVisible !== nextProps.isDialogVisible ) {
			this.setState( {
				confirmInput: '',
			} );
		}
	}

	onInputChange( event ) {
		this.setState( {
			confirmInput: event.target.value,
		} );
	}

	renderButtons() {
		const onClickKeepContent = () => this.props.onThemeSetupClick( true, this.props.site.ID );
		const onClickDeleteContent = () => this.props.onThemeSetupClick( false, this.props.site.ID );
		const onClickViewSite = () => page( this.props.site.URL );
		const cancel = { action: 'cancel', label: this.props.translate( 'Cancel' ) };
		const deleteContent = (
			<Button
				primary
				scary
				disabled={ 'delete' !== this.state.confirmInput }
				onClick={ onClickDeleteContent }>
				{ this.props.translate( 'Set Up And Delete Content' ) }
			</Button>
		);
		const keepContent = (
			<Button
				primary
				onClick={ onClickKeepContent }>
				{ this.props.translate( 'Set Up And Keep Content' ) }
			</Button>
		);
		const backToSetup = (
			<Button
				disabled={ this.props.isActive }
				onClick={ this.props.onClick }>
				{ this.props.translate( 'Back To Setup' ) }
			</Button>
		);
		const viewSite = (
			<Button
				primary
				disabled={ this.props.isActive }
				onClick={ onClickViewSite }>
				{ this.props.translate( 'View Site' ) }
			</Button>
		);

		if ( this.props.isActive ) {
			return [
				backToSetup,
				viewSite
			];
		}
		if ( this.props.saveExisting ) {
			return [
				cancel,
				keepContent,
			];
		}
		return [
			cancel,
			deleteContent,
		];
	}

	renderLoading() {
		return (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
	}

	renderContent() {
		if ( this.props.saveExisting ) {
			return (
				<div>
					<h1>{ this.props.translate( 'Confirm Theme Setup' ) }</h1>
					<p>
						{ this.props.translate( 'Settings will be changed on {{strong}}%(site)s{{/strong}}, but no content will be deleted. These changes will be live immmediately. Do you want to proceed?', {
							components: {
								strong: <strong />,
							},
							args: {
								site: this.props.site.domain,
							}
						} ) }
					</p>
				</div>
			);
		} else {
			return (
				<div>
					<h1>{ this.props.translate( 'Confirm Theme Setup' ) }</h1>
					<p>
						{ this.props.translate( 'Please type {{warn}}delete{{/warn}} into the field below to confirm. {{strong}}All content on %(site)s will be deleted{{/strong}}, and then your site will be set up. These changes will be live immediately.', {
							components: {
								warn: <span className="theme-setup-dialog__confirm-text"/>,
								strong: <strong />,
							},
							args: {
								site: this.props.site.domain,
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
							isError={ 'delete' !== this.state.confirmInput }
							text={ 'delete' !== this.state.confirmInput
								? this.props.translate( 'Text does not match.' )
								: this.props.translate( 'Text matches.' ) } />
					</FormFieldset>
				</div>
			);
		}
	}

	render() {
		return (
			<Dialog className="theme-setup-dialog"
				isVisible={ this.props.isDialogVisible }
				buttons={ this.renderButtons() }
				onClose={ this.props.isActive ? null : this.props.closeDialog }>
				{ this.props.isActive
					? this.renderLoading()
					: this.renderContent() }
			</Dialog>
		);
	}
}

ThemeSetupDialog = localize( ThemeSetupDialog );

const mapStateToProps = ( state ) => {
	const isDialogVisible = state.ui.themeSetup.isDialogVisible;
	const isActive = state.ui.themeSetup.active;
	const saveExisting = state.ui.themeSetup.saveExisting;
	const site = getSelectedSite( state );
	return {
		isDialogVisible,
		isActive,
		saveExisting,
		site,
	};
};

export default connect( mapStateToProps, { closeDialog, onThemeSetupClick: runThemeSetup } )( ThemeSetupDialog );

