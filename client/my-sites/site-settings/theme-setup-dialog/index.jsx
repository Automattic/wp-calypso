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
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import PulsingDot from 'components/pulsing-dot';
import { getSelectedSite } from 'state/ui/selectors';
import { closeDialog, runThemeSetup } from 'state/ui/theme-setup/actions';

class ThemeSetupDialog extends React.Component {
	renderButtons( { onThemeSetupClick, site, isActive, result, translate } ) {
		const keepContent = {
			action: 'keep-content',
			label: translate( 'Set Up Your Theme' ),
			isPrimary: true,
			onClick: () => onThemeSetupClick( true, site.ID ),
		};
		const cancel = {
			action: 'cancel',
			label: translate( 'Cancel' ),
		};
		const backToSetup = {
			action: 'back-to-setup',
			label: translate( 'Back To Setup' ),
			disabled: isActive,
		};
		const viewSite = {
			action: 'view-site',
			label: translate( 'View Site' ),
			isPrimary: true,
			disabled: isActive,
			onClick: () => page( site.URL ),
		};

		if ( isActive || 'success' === result.result ) {
			return [
				backToSetup,
				viewSite
			];
		}
		return [
			cancel,
			keepContent,
		];
	}

	renderContent( { isActive, result, site, translate } ) {
		const keepContent = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'Settings will be changed on {{strong}}%(site)s{{/strong}}, and these changes will be live immmediately. Do you want to proceed?', {
						components: {
							strong: <strong />,
						},
						args: {
							site: site.domain,
						}
					} ) }
				</p>
			</div>
		);
		const loading = (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
		const success = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'Success! Your theme is all set up like the demo.' ) }
				</p>
			</div>
		);
		const failure = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate( 'We encountered a problem – would you like to try again?' ) }
				</p>
			</div>
		);
		if ( isActive ) {
			return loading;
		}
		if ( result ) {
			return ( 'success' === result.result ) ? success : failure;
		}
		return keepContent;
	}

	render() {
		return (
			<Dialog className="theme-setup-dialog"
				isVisible={ this.props.isDialogVisible }
				buttons={ this.renderButtons( this.props ) }
				onClose={ this.props.isActive ? null : this.props.closeDialog }>
				{ this.renderContent( this.props ) }
			</Dialog>
		);
	}
}

ThemeSetupDialog = localize( ThemeSetupDialog );

const mapStateToProps = ( state ) => {
	const isDialogVisible = state.ui.themeSetup.isDialogVisible;
	const isActive = state.ui.themeSetup.active;
	const result = state.ui.themeSetup.result;
	const saveExisting = state.ui.themeSetup.saveExisting;
	const site = getSelectedSite( state );
	return {
		isDialogVisible,
		isActive,
		result,
		saveExisting,
		site,
	};
};

export default connect( mapStateToProps, { closeDialog, onThemeSetupClick: runThemeSetup } )( ThemeSetupDialog );

