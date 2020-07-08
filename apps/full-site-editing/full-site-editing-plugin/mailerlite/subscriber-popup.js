/* global ml,jetpackMailerliteSettings */

( function () {
	window.ml_account = ml(
		'accounts',
		jetpackMailerliteSettings.account,
		jetpackMailerliteSettings.uuid,
		'load'
	);
} )();
