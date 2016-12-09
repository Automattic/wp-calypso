/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	upgradesActions = require( 'lib/upgrades/actions' );

import Notice from 'components/notice';

var SiteRedirectNotice = React.createClass( {
	propTypes: {
		notice: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	handleClick( event ) {
		event.preventDefault();

		upgradesActions.closeSiteRedirectNotice( this.props.selectedSite.domain );
	},

	render() {
		if ( this.props.notice ) {
			return (
				<Notice
					raw={ { onRemoveCallback: this.handleClick } }
					status={ notices.getStatusHelper( this.props.notice ) }
					text={ this.props.notice.text } />
			);
		} else {
			return null;
		}
	}
} );

module.exports = SiteRedirectNotice;
