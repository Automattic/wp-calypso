/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import { getOriginalUserSetting } from 'state/selectors';
import { saveUserSettings } from 'state/user-settings/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import LanguagePickerModal from './modal';

class LanguageButton extends Component {
	state = {
		open: false
	}

	toggleOpen = () => {
		this.setState( { open: ! this.state.open } );
	}

	handleClose = () => {
		this.setState( { open: false } );
	}

	selectLanguage = ( newLanguageSlug ) => {
		if ( newLanguageSlug === this.props.languageSlug ) {
			return;
		}

		this.props.saveUserSettings(
			{ language: newLanguageSlug },
			successNotice( this.props.translate( 'Your language was changed successfully!' ) ),
			errorNotice( this.props.translate( 'There was a problem changing your language.' ) )
			// TODO: window.location = window.location.pathname + '?updated=success';
		);
	}

	// TODO: Reorganize the styles and get rid of the eslint errors
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	renderIcon( languageSlug ) {
		if ( ! languageSlug ) {
			return <div className="sidebar__footer-lang-icon is-loading" />;
		}

		const [ langCode, langSubcode ] = languageSlug.split( '-' );

		return (
			<div className="sidebar__footer-lang-icon">
				<div>
					{ langCode }
					{ langSubcode && <br /> }
					{ langSubcode }
				</div>
			</div>
		);
	}

	render() {
		const { languageSlug, translate } = this.props;

		return (
			<Button
				className="sidebar__footer-lang"
				borderless
				title={ translate( 'Interface Language' ) }
				onClick={ this.toggleOpen }
			>
				{ this.renderIcon( languageSlug ) }
				<LanguagePickerModal
					isVisible={ this.state.open }
					languages={ config( 'languages' ) }
					onClose={ this.handleClose }
					onSelected={ this.selectLanguage }
					selected={ languageSlug }
				/>
			</Button>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default connect(
	state => ( {
		// Look at the original setting - there might be an unsaved /me/account
		// form displayed on the page, and we don't want to display the unsaved
		// change - only the committed one.
		languageSlug: getOriginalUserSetting( state, 'language' )
	} ),
	{ saveUserSettings }
)( localize( LanguageButton ) );
