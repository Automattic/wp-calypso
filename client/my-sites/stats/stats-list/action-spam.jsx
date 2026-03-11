import { Button, Modal, Tooltip } from '@wordpress/components';
import { Icon, warning } from '@wordpress/icons';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import wpcom from 'calypso/lib/wp';
import { requestSiteStats } from 'calypso/state/stats/lists/actions';
import './actions-spam.scss';

const debug = debugFactory( 'calypso:stats:action-spam' );

class StatsActionSpam extends Component {
	static displayName = 'StatsActionSpam';

	state = {
		showConfirmDialog: false,
		spammed: false,
	};

	closeConfirmDialog = () => {
		this.setState( { showConfirmDialog: false } );
	};

	clickHandler = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		// Component used in old stats list, fallback to legacy behavior without dialog.
		if ( ! this.props.inHorizontalBarList ) {
			this.toggleSpamState();
			return;
		}

		// Confirm marking as spam with dialog.
		if ( ! this.state.spammed ) {
			this.setState( { showConfirmDialog: true } );
			return;
		}

		// Allow unmarking as spam without confirmation.
		this.toggleSpamState();
	};

	markAsSpam = () => {
		this.closeConfirmDialog();
		this.toggleSpamState();
	};

	toggleSpamState() {
		const spamType = this.state.spammed ? 'statsReferrersSpamDelete' : 'statsReferrersSpamNew';
		const gaEvent = this.state.spammed ? 'Undid Referrer Spam' : 'Marked Referrer as Spam';
		debug( this.state );
		this.setState( { spammed: ! this.state.spammed } );

		if ( this.props.afterChange ) {
			this.props.afterChange( ! this.state.spammed );
		}

		const wpcomSite = wpcom.site( this.props.data.siteID );
		wpcomSite[ spamType ].call( wpcomSite, this.props.data.domain, () => {
			if ( this.props.statsQuery ) {
				this.props.requestSiteStats(
					this.props.data.siteID,
					'statsReferrers',
					this.props.statsQuery
				);
			}
		} );
		gaRecordEvent( 'Stats', gaEvent + ' in ' + this.props.moduleName + ' List' );
	}

	render() {
		const label = this.state.spammed
			? this.props.translate( 'Mark as Not Spam' )
			: this.props.translate( 'Mark as Spam', {
					context: 'Stats: Action to mark an item as spam',
					comment: 'Default label (changes into "Mark as Not Spam").',
			  } );
		const title = this.state.spammed
			? this.props.translate( 'Mark as Not Spam', {
					textOnly: true,
					context: 'Stats: Action to undo marking an item as spam',
			  } )
			: this.props.translate( 'Mark as Spam', {
					textOnly: true,
					context: 'Stats: Action to mark an item as spam',
			  } );

		const wrapperClass = clsx( 'module-content-list-item-action-wrapper', 'is-link', {
			spam: ! this.state.spammed,
			unspam: this.state.spammed,
		} );

		return (
			<li className="stats-list__spam-action module-content-list-item-action">
				<Tooltip position="top" text={ title }>
					<button onClick={ this.clickHandler } className={ wrapperClass } aria-label={ title }>
						<Icon className="stats-icon" icon={ warning } size={ 22 } />
						<span className="stats-list__spam-label module-content-list-item-action-label">
							{ label }
						</span>
					</button>
				</Tooltip>
				{ this.props.inHorizontalBarList && this.state.showConfirmDialog && (
					<Modal
						title={ this.props.translate( 'Mark as spam' ) }
						onRequestClose={ this.closeConfirmDialog }
						className="action-spam__confirm-modal"
					>
						<p>
							{ this.props.translate( "Are you sure you want to mark '%(domain)s' as spam?", {
								args: { domain: this.props.data?.domain },
							} ) }
						</p>
						<p>
							{ this.props.translate(
								'This will hide this referrer from your future stats. Historical stats will not be affected. You can undo this later from the spam referrers list.'
							) }
						</p>
						<div style={ { display: 'flex', justifyContent: 'flex-end', gap: '8px' } }>
							<Button variant="tertiary" onClick={ this.closeConfirmDialog }>
								{ this.props.translate( 'Cancel' ) }
							</Button>
							<Button variant="primary" onClick={ this.markAsSpam }>
								{ this.props.translate( 'Mark as spam' ) }
							</Button>
						</div>
					</Modal>
				) }
			</li>
		);
	}
}

export default connect( null, { requestSiteStats } )( localize( StatsActionSpam ) );
