/**
 * `AccountRecoveryReset` constructor.
 *
 * @constructor
 * @param {Object} userData  An object containing either user or firstname, lastname and url
 * @param {Object} wpcom     WPCOM object
 * @public
 */
function AccountRecoveryReset( userData, wpcom ) {
	if ( ! ( this instanceof AccountRecoveryReset ) ) {
		return new AccountRecoveryReset( userData, wpcom );
	}

	this._userData = userData;
	this.wpcom = wpcom;
}

AccountRecoveryReset.prototype.getResetOptions = function() {
	return this.wpcom.req.get( {
		body: this._userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} );
};

export default AccountRecoveryReset;
