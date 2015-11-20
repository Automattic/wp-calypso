/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var DeleteSiteStore = require( 'lib/sites-list/delete-site-store' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	SitesListActions = require( 'lib/sites-list/actions' );

module.exports = React.createClass( {
	displayName: 'DeleteSiteNotices',

	getInitialState: function() {
		var deleteSiteData = DeleteSiteStore.get();
		return {
			site: deleteSiteData.site,
			status: deleteSiteData.status
		};
	},

	componentDidMount: function() {
		DeleteSiteStore.on( 'change', this._updateDeleteSiteStore );
	},

	componentWillUnmount: function() {
		DeleteSiteStore.off( 'change', this._updateDeleteSiteStore );
	},

	render: function() {
		var site = this.state.site,
			status = this.state.status,
			content;

		if ( ! status || ! site ) {
			return null;
		}

		switch( status ) {
			case 'deleting':
				content =
				<SimpleNotice status='is-success' showDismiss={ false }>{
					this.translate( '{{strong}}%(siteDomain)s{{/strong}} is being deleted.', {
						components: { strong: <strong /> },
						args: { siteDomain: site.domain }
					} )
				}</SimpleNotice>;
				break;
			case 'deleted':
				content =
				<SimpleNotice status='is-success' showDismiss={ true } onClick={ this._clearDeleted }>{
					this.translate( '{{strong}}%(siteDomain)s{{/strong}} has been deleted.', {
						components: { strong: <strong /> },
						args: { siteDomain: site.domain }
					} )
				}</SimpleNotice>;
				break;
			case 'error':
				content =
				<SimpleNotice status='is-error' showDismiss={ true } onClick={ this._clearDeleted }>{
					this.translate( 'There was an error deleting {{strong}}%(siteDomain)s{{/strong}}.', {
						components: { strong: <strong /> },
						args: { siteDomain: site.domain }
					} )
				}</SimpleNotice>;
				break;
		}

		return content;
	},

	_updateDeleteSiteStore: function() {
		var deleteSiteData = DeleteSiteStore.get();
		this.setState( {
			site: deleteSiteData.site,
			status: deleteSiteData.status
		} );
	},

	_clearDeleted: function() {
		SitesListActions.clearDeleteSiteStore();
	}
} );
