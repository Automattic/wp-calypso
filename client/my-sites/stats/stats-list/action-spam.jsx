/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:stats:action-spam' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import analytics from 'lib/analytics';
import Gridicon from 'gridicons';

class StatsActionSpam extends React.Component {
	static displayName = 'StatsActionSpam';

	state = {
		spammed: false,
	};

	clickHandler = event => {
		let spamType = this.state.spammed ? 'statsReferrersSpamDelete' : 'statsReferrersSpamNew',
			gaEvent = this.state.spammed ? 'Undid Referrer Spam' : 'Marked Referrer as Spam',
			wpcomSite;
		event.stopPropagation();
		event.preventDefault();
		debug( this.state );
		this.setState( {
			spammed: ! this.state.spammed,
		} );

		if ( this.props.afterChange ) {
			this.props.afterChange( ! this.state.spammed );
		}

		wpcomSite = wpcom.site( this.props.data.siteID );
		wpcomSite[ spamType ].call( wpcomSite, this.props.data.domain, function() {} );
		analytics.ga.recordEvent( 'Stats', gaEvent + ' in ' + this.props.moduleName + ' List' );
	};

	render() {
		let label = this.state.spammed
				? this.props.translate( 'Not Spam' )
				: this.props.translate( 'Spam', {
						context: 'Stats: Action to mark an item as spam',
						comment: 'Default label (changes into "Not Spam").',
				  } ),
			title = this.state.spammed
				? this.props.translate( 'Not Spam', {
						textOnly: true,
						context: 'Stats: Action to undo marking an item as spam',
						comment:
							'Secondary label (default label is "Spam"). Recommended to use a very short label.',
				  } )
				: this.props.translate( 'Spam', {
						textOnly: true,
						context: 'Stats: Action to mark an item as spam',
						comment: 'Default label (changes into "Not Spam").',
				  } ),
			wrapperClass = classNames( 'module-content-list-item-action-wrapper', {
				spam: ! this.state.spammed,
				unspam: this.state.spammed,
			} );

		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className={ wrapperClass }
					title={ title }
					aria-label={ title }
				>
					<Gridicon icon="spam" size={ 18 } />
					<span className="module-content-list-item-action-label">{ label }</span>
				</a>
			</li>
		);
	}
}

export default localize( StatsActionSpam );
