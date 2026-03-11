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
						title={ this.props.translate( 'Mark as spam?' ) }
						onRequestClose={ this.closeConfirmDialog }
						className="action-spam__confirm-modal"
						// React synthetic events from portals bubble through the component
						// tree, not the DOM tree. Without this, Enter/Space inside the modal
						// would reach the parent row's onKeyDown handler and navigate to the
						// referrer URL. Escape is allowed through so the modal can still close.
						onKeyDown={ ( event ) => {
							if ( event.key !== 'Escape' ) {
								event.stopPropagation();
							}
						} }
					>
						<p>
							{ this.props.translate(
								'Marking {{strong}}%(domain)s{{/strong}} as spam will hide this referrer from your future stats. Historical stats will not be affected.',
								{
									args: { domain: this.props.data?.domain },
									components: { strong: <strong /> },
								}
							) }
						</p>
						<p>
							{ this.props.translate(
								'You can undo this action and manage spam referrers from the referrers detail page.'
							) }
						</p>
						<div className="action-spam__confirm-modal-actions">
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
