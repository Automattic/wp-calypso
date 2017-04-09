/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:action-spam' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	analytics = require( 'lib/analytics' ),
	Gridicon = require( 'gridicons' );

module.exports = React.createClass( {
	displayName: 'StatsActionSpam',

	getInitialState: function() {
		return {
			spammed: false
		};
	},

	clickHandler: function( event ) {
		var spamType = this.state.spammed ? 'statsReferrersSpamDelete' : 'statsReferrersSpamNew',
			gaEvent = this.state.spammed ? 'Undid Referrer Spam' : 'Marked Referrer as Spam',
			wpcomSite;
		event.stopPropagation();
		event.preventDefault();
		debug( this.state );
		this.setState( {
			spammed: ! this.state.spammed
		} );

		if ( this.props.afterChange ) {
			this.props.afterChange( ! this.state.spammed );
		}

		wpcomSite = wpcom.site( this.props.data.siteID );
		wpcomSite[ spamType ].call( wpcomSite, this.props.data.domain, function() {} );
		analytics.ga.recordEvent( 'Stats', gaEvent + ' in ' + this.props.moduleName + ' List' );
	},

	render: function() {
		var label = this.state.spammed ? this.translate( 'Not Spam' ) : this.translate( 'Spam', {
				context: 'Stats: Action to mark an item as spam',
				comment: 'Default label (changes into "Not Spam").'
			} ),
			title = this.state.spammed ? this.translate( 'Not Spam', {
				textOnly: true,
				context: 'Stats: Action to undo marking an item as spam',
				comment: 'Secondary label (default label is "Spam"). Recommended to use a very short label.'
			} ) : this.translate( 'Spam', {
				textOnly: true,
				context: 'Stats: Action to mark an item as spam',
				comment: 'Default label (changes into "Not Spam").'
			} ),

			wrapperClass = classNames(
				'module-content-list-item-action-wrapper',
				{
					spam: ! this.state.spammed,
					unspam: this.state.spammed
				}
			);

		return (
			<li className="module-content-list-item-action">
				<a href="#" onClick={ this.clickHandler } className={ wrapperClass } title={ title } aria-label={ title }>
					<Gridicon icon="spam" size={ 18 } />
					<span className="module-content-list-item-action-label">{ label }</span>
				</a>
			</li>
		);
	}
} );
