/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import translator from 'lib/translator';
import localStorageHelper from 'store';
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';

class TranslatorLauncher extends React.PureComponent {
	static displayName = 'TranslatorLauncher';

	static propTypes = {
		isActive: PropTypes.bool.isRequired,
		isEnabled: PropTypes.bool.isRequired,
	};

	state = {
		infoDialogVisible: false,
		firstActivation: true,
	};

	componentWillReceiveProps( nextProps ) {
		if ( ! this.props.isActive && nextProps.isActive ) {
			// Activating
			if ( ! localStorageHelper.get( 'translator_hide_infodialog' ) ) {
				this.setState( { infoDialogVisible: true } );
			}

			if ( this.state.firstActivation ) {
				analytics.mc.bumpStat( 'calypso_translator_toggle', 'intial_activation' );
				this.setState( { firstActivation: false } );
			}
		}
	}

	toggleInfoCheckbox = event => {
		localStorageHelper.set( 'translator_hide_infodialog', event.target.checked );
	};

	infoDialogClose = () => {
		this.setState( { infoDialogVisible: false } );
	};

	toggle = event => {
		event.preventDefault();
		analytics.mc.bumpStat( 'calypso_translator_toggle', this.props.isActive ? 'off' : 'on' );
		translator.toggle();
	};

	render() {
		let launcherClasses = 'community-translator';
		let toggleString;

		if ( ! this.props.isEnabled ) {
			return null;
		}

		if ( this.props.isActive ) {
			toggleString = this.props.translate( 'Disable Translator' );
			launcherClasses += ' is-active';
		} else {
			toggleString = this.props.translate( 'Enable Translator' );
		}

		const infoDialogButtons = [ { action: 'cancel', label: this.props.translate( 'Ok' ) } ];

		return (
			<div>
				<Dialog
					isVisible={ this.state.infoDialogVisible }
					buttons={ infoDialogButtons }
					onClose={ this.infoDialogClose }
					additionalClassNames="community-translator__modal"
				>
					<h1>{ this.props.translate( 'Community Translator' ) }</h1>
					<p>
						{ this.props.translate(
							'You have now enabled the translator.  Right click highlighted text to translate it.'
						) }
					</p>
					<p>
						<label>
							<input type="checkbox" onClick={ this.toggleInfoCheckbox } />
							<span>{ this.props.translate( "Don't show again" ) }</span>
						</label>
					</p>
				</Dialog>
				<div className={ launcherClasses }>
					<a
						className="community-translator__button"
						onClick={ this.toggle }
						title={ this.props.translate( 'Community Translator' ) }
					>
						<Gridicon icon="globe" />
						<div className="community-translator__text">{ toggleString }</div>
					</a>
				</div>
			</div>
		);
	}
}

export default localize( TranslatorLauncher );
