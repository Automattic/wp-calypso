/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import EnableLocaleCheckbox from './enable-locale-checkbox';
import config from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import i18n from 'lib/mixins/i18n'

class SupportUserActiveDialog extends Component {

	render() {
		const { isVisible, onCloseDialog, onRestoreUser } = this.props;

		const { defaultLocaleSlug, userLocaleSlug } = this.props;

		const buttons = [
			<FormButton
				key="close"
				isPrimary={ false }
				onClick={ onCloseDialog }>
					Close
			</FormButton>,
			<FormButton
				key="restoreuser"
				isPrimary={ false }
				onClick={ onRestoreUser }>
					Restore User
			</FormButton>
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ onCloseDialog }
				buttons={ buttons }>
				<h2 className="support-user__heading">Support user</h2>
				{ defaultLocaleSlug !== userLocaleSlug &&
					<FormLabel>
						<EnableLocaleCheckbox
							defaultLocaleSlug={ defaultLocaleSlug }
							userLocaleSlug={ userLocaleSlug } />
						{ i18n.translate( 'Display Calypso in user locale' ) }
					</FormLabel>
				}
			</Dialog>
		);
	}
}

SupportUserActiveDialog.defaultProps = {
	defaultLocaleSlug: config( 'i18n_default_locale_slug' )
}

const mapStateToProps = ( state ) => {
	return {
		userLocaleSlug: getCurrentUser( state ).localeSlug,
	}
}

export default connect( mapStateToProps )( SupportUserActiveDialog );
