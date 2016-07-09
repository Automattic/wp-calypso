/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:site-settings:jetpack-sync-panel' );

const JetpackSyncPanel = React.createClass( {
	displayName: 'JetpackSyncPanel',

	shouldDisableSync() {
		return true;
	},

	onSyncRequestButtonClick( event ) {
		event.preventDefault();
		debug( 'Perform full sync button clicked' );
	},

	renderStatusNotice() {
		const classes = classNames( 'jetpack-sync-panel__notice' );
		return (
			<Notice isCompact className={ classes }>
				Placeholder text
			</Notice>
		);
	},

	renderProgressBar() {
		return (
			<ProgressBar value={ 0 } />
		);
	},

	render() {
		return (
			<Card className="jetpack-sync-panel">
				<div className="jetpack-sync-panel__action-group">
					<div className="jetpack-sync-panel__description">
						{ this.translate(
							'{{strong}}Jetpack Sync keeps your WordPress.com dashboard up to date.{{/strong}} ' +
							'Data is sent from your site to the WordPress.com dashboard regularly to provide a faster experience. ' +
							'If you suspect some data is missing, you can initiate a sync manually.',
							{
								components: {
									strong: <strong />
								}
							}
						) }
					</div>

					<div className="jetpack-sync-panel__action">
						<Button onClick={ this.onSyncRequestButtonClick } disabled={ this.shouldDisableSync() }>
							{ this.translate( 'Perform full sync', { context: 'Button' } ) }
						</Button>
					</div>
				</div>

				{ this.renderStatusNotice() }
				{ this.renderProgressBar() }
			</Card>
		);
	}
} );

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId
		};
	},
	dispatch => bindActionCreators( {}, dispatch )
)( JetpackSyncPanel );
