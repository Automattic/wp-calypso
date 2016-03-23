// External Dependencies
var assert = require( 'chai' ).assert;

var resizeImageUrl = require( '..' ),
	safeImageUrl = 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=1000&h=1000';

// helper functions
describe( 'index', function() {
	it( 'should strip the w and h query params', function() {
		var resizedImageUrl = resizeImageUrl( safeImageUrl );
		assert.equal( resizedImageUrl, 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg' );
	} );

	it( 'should delete the resize & fit query params', function() {
		var resizedImageUrl = resizeImageUrl( safeImageUrl + '&resize=foo&fit=meh' );
		assert.equal( resizedImageUrl, 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg' );
	} );

	it( 'should append optional resize arguments', function() {
		var resizedImageUrl = resizeImageUrl( safeImageUrl, { resize: '40,40' } );
		assert.equal( resizedImageUrl, 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=40%2C40' );
	} );

	it( 'should not attempt to resize non-HTTP protocols', function() {
		var imageUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		var resizedImageUrl = resizeImageUrl( imageUrl, { resize: '40,40' } );
		assert.equal( resizedImageUrl, imageUrl );
	} );
} );
