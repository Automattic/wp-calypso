module.exports = {
	canManage: function( selectedSite ) {
		if ( ! this.props.sites ) {
			return true;
		}
		selectedSite = selectedSite || this.props.sites.getSelectedSite();
		if ( ! selectedSite ) {
			return true;
		}
		if ( ! selectedSite || ! selectedSite.modulesFetched ) {
			return true;
		}
		if ( ! selectedSite.getModule( 'manage' ) ||
				! selectedSite.getModule( 'manage' ).active ) {
			return false;
		}
		return true;
	},

};