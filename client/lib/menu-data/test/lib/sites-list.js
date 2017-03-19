/**
 * Stub wp module to avoid its dependency on the browser
 **/


function Sites() {
	if ( ! ( this instanceof Sites ) ) {
		return new Sites();
	}
}

Sites.prototype.on = function() {
	return this;
};

Sites.prototype.getSelectedSite = function() {
	return { ID: 1 } ;
};


export default Sites;
