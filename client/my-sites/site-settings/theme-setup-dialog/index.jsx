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
import { Dialog } from '@automattic/components';
import PulsingDot from 'calypso/components/pulsing-dot';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	toggleDialog,
	runThemeSetup as runThemeSetupAction,
} from 'calypso/state/theme-setup/actions';
import {
	isThemeSetupDialogVisible,
	isThemeSetupActive,
	getThemeSetupResult,
} from 'calypso/state/theme-setup/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class ThemeSetupDialog extends React.Component {
	renderButtons( { runThemeSetup, site, isActive, result, translate } ) {
		const keepContent = {
			action: 'keep-content',
			label: translate( 'Set Up Your Theme' ),
			isPrimary: true,
			onClick: () => runThemeSetup( site.ID ),
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
			return [ backToSetup, viewSite ];
		}
		return [ cancel, keepContent ];
	}

	renderContent( { isActive, result, site, translate } ) {
		const keepContent = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>
					{ translate(
						'Settings will be changed on {{strong}}%(site)s{{/strong}}, and these changes will be live immediately. Do you want to proceed?',
						{
							components: {
								strong: <strong />,
							},
							args: {
								site: site.domain,
							},
						}
					) }
				</p>
			</div>
		);
		const loading = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>{ translate( 'Running Theme Setup. This may take up to a minute.' ) }</p>
				<PulsingDot active />
			</div>
		);
		const success = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>{ translate( 'Success! Your theme is all set up like the demo.' ) }</p>
			</div>
		);
		const failure = (
			<div>
				<h1>{ translate( 'Theme Setup' ) }</h1>
				<p>{ translate( 'We encountered a problem – would you like to try again?' ) }</p>
			</div>
		);
		if ( isActive ) {
			return loading;
		}
		if ( result ) {
			return 'success' === result.result ? success : failure;
		}
		return keepContent;
	}

	render() {
		return (
			<Dialog
				className="theme-setup-dialog"
				isVisible={ this.props.isDialogVisible }
				buttons={ this.renderButtons( this.props ) }
				onClose={ this.props.isActive ? null : this.props.toggleDialog }
			>
				{ this.renderContent( this.props ) }
			</Dialog>
		);
	}
}

const mapStateToProps = ( state ) => {
	const isDialogVisible = isThemeSetupDialogVisible( state );
	const isActive = isThemeSetupActive( state );
	const result = getThemeSetupResult( state );
	const site = getSelectedSite( state );
	return {
		isDialogVisible,
		isActive,
		result,
		site,
	};
};

export default connect( mapStateToProps, { toggleDialog, runThemeSetup: runThemeSetupAction } )(
	localize( ThemeSetupDialog )
);
