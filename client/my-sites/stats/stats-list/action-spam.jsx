/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { gaRecordEvent } from 'lib/analytics/ga';
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';

const debug = debugFactory( 'calypso:stats:action-spam' );

class StatsActionSpam extends React.Component {
	static displayName = 'StatsActionSpam';

	state = {
		spammed: false,
	};

	clickHandler = event => {
		const spamType = this.state.spammed ? 'statsReferrersSpamDelete' : 'statsReferrersSpamNew';
		const gaEvent = this.state.spammed ? 'Undid Referrer Spam' : 'Marked Referrer as Spam';
		event.stopPropagation();
		event.preventDefault();
		debug( this.state );
		this.setState( {
			spammed: ! this.state.spammed,
		} );

		if ( this.props.afterChange ) {
			this.props.afterChange( ! this.state.spammed );
		}

		const wpcomSite = wpcom.site( this.props.data.siteID );
		wpcomSite[ spamType ].call( wpcomSite, this.props.data.domain, function() {} );
		gaRecordEvent( 'Stats', gaEvent + ' in ' + this.props.moduleName + ' List' );
	};

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

		const wrapperClass = classNames( 'module-content-list-item-action-wrapper', 'is-link', {
			spam: ! this.state.spammed,
			unspam: this.state.spammed,
		} );

		return (
			<li className="stats-list__spam-action module-content-list-item-action">
				<Button
					href="#"
					onClick={ this.clickHandler }
					className={ wrapperClass }
					title={ title }
					aria-label={ title }
				>
					<Gridicon icon="spam" size={ 18 } />
					<span className="stats-list__spam-label module-content-list-item-action-label">
						{ label }
					</span>
				</Button>
			</li>
		);
	}
}

export default localize( StatsActionSpam );
