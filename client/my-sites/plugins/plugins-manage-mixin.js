module.exports = {
	canManage: function( selectedSite ) {
		if ( ! this.props.sites ) {
			return true;
		}
		selectedSite = selectedSite || this.props.sites.getSelectedSite();
		if ( ! selectedSite ) {
			return true;
		}
		if ( ! selectedSite.isModuleActive( 'manage' ) ) {
			return false;
		}
		return true;
	},

};
