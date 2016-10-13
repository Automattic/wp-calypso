/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect,
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	assign = require( 'lodash/assign' );

var State = require( '../constants' ).state,
	useMockery = require( 'test/helpers/use-mockery' ),
	SiteStore, SiteStoreActions;

var readSiteStub,
	changeSpy = sinon.spy(),
	mockWpcom = {
		undocumented: function() {
			return { readSite: readSiteStub };
		}
	};

var SiteExample = {
	ID: 77203074,
	name: 'Just You Wait',
	description: 'Sweet little tests all in a Box',
	URL: 'https://testonesite2014.wordpress.com',
	jetpack: false,
	post_count: 1,
	subscribers_count: 1,
	lang: 'en',
	logo: {
		id: 0,
		sizes: [],
		url: ''
	},
	visible: true,
	is_private: false,
	is_following: false,
	options: {
		timezone: '',
		gmt_offset: 0,
		videopress_enabled: false,
		upgraded_filetypes_enabled: false,
		login_url: 'https://testonesite2014.wordpress.com/wp-login.php',
		admin_url: 'https://testonesite2014.wordpress.com/wp-admin/',
		is_mapped_domain: false,
		is_redirect: false,
		unmapped_url: 'https://testonesite2014.wordpress.com',
		featured_images_enabled: false,
		theme_slug: 'pub/penscratch',
		header_image: {
			attachment_id: 28,
			url: 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg',
			thumbnail_url: 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg',
			height: 1280,
			width: 850
		},
		background_color: false,
		image_default_link_type: 'file',
		image_thumbnail_width: 150,
		image_thumbnail_height: 150,
		image_thumbnail_crop: 0,
		image_medium_width: 300,
		image_medium_height: 300,
		image_large_width: 1024,
		image_large_height: 1024,
		permalink_structure: '/%year%/%monthnum%/%day%/%postname%/',
		post_formats: [],
		default_post_format: '0',
		default_category: 1,
		allowed_file_types: [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'pdf',
			'doc',
			'ppt',
			'odt',
			'pptx',
			'docx',
			'pps',
			'ppsx',
			'xls',
			'xlsx',
			'key'
		],
		show_on_front: 'posts',
		default_likes_enabled: true,
		default_sharing_status: true,
		default_comment_status: true,
		default_ping_status: true,
		software_version: '4.4-alpha-33842',
		created_at: '2014-10-18T17:14:52+00:00',
		wordads: false,
		publicize_permanently_disabled: false
	},
	meta: {
		links: {
			self: 'https://public-api.wordpress.com/rest/v1.1/sites/77203074',
			help: 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/help',
			posts: 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/posts/',
			comments: 'https://public-api.wordpress.com/rest/v1.1/sites/77203074/comments/',
			xmlrpc: 'https://testonesite2014.wordpress.com/xmlrpc.php'
		}
	},
	user_can_manage: true
};

describe( 'store', function() {
	useMockery();
	before( function() {
		mockery.registerAllowable( [ '../', '../actions' ] );
		mockery.registerMock( 'lib/wp', mockWpcom );

		SiteStore = require( '../index' );
		SiteStoreActions = require( '../actions' );
		SiteStore.on( 'change', changeSpy );
	} );

	after( function() {
		SiteStore.off( 'change', changeSpy );
	} );

	beforeEach( function() {
		readSiteStub = mockWpcom.undocumented().readSite = sinon.stub();
		changeSpy.reset();
	} );

	it( 'should have a dispatch token', function() {
		expect( SiteStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should not contain an unknown Site ID', function() {
		expect( SiteStore.get( 'UNKNOWN' ) ).to.be.undefined;
	} );

	it( 'should accept a good response', function() {
		var Site = assign( {}, SiteExample ),
			SiteFromStore;

		readSiteStub.callsArgWith( 1, null, Site );

		SiteStoreActions.fetch( 77203074 );

		expect( changeSpy.callCount ).to.equal( 1 );

		SiteFromStore = SiteStore.get( 77203074 );

		expect( SiteFromStore ).to.be.ok;
		expect( SiteFromStore.get( 'state' ) ).to.equal( State.COMPLETE );

		delete Site.meta;
		Site.domain = 'testonesite2014.wordpress.com';
		Site.slug = 'testonesite2014.wordpress.com';
		Site.title = 'Just You Wait';
		expect( SiteFromStore.toJS() ).to.eql( Site );
	} );

	it( 'should pass through the pending state and prevent double fetches', function() {
		SiteStoreActions.fetch( 'twice' );
		SiteStoreActions.fetch( 'twice' );

		expect( readSiteStub.callCount ).to.equal( 1 );
	} );

	it( 'should accept an error', function() {
		var error = 'boom', SiteFromStore;

		readSiteStub.callsArgWith( 1, error, null );

		SiteStoreActions.fetch( 'BAD' );

		expect( changeSpy.callCount ).to.equal( 1 );

		SiteFromStore = SiteStore.get( 'BAD' );

		expect( SiteFromStore ).to.be.ok;
		expect( SiteFromStore.get( 'state' ) ).to.equal( State.ERROR );
		expect( SiteFromStore.get( 'error' ) ).to.equal( error );
	} );

	it( 'should set has_featured with meta link', function() {
		var Site = assign( {}, SiteExample ),
			SiteFromStore;

		Site.meta.links.featured = 'https://public-api.wordpress.com/rest/v1.1/read/sites/77203074/featured';

		readSiteStub.callsArgWith( 1, null, Site );

		SiteStoreActions.fetch( 77203074 );
		SiteFromStore = SiteStore.get( 77203074 );

		expect( SiteFromStore.toJS().has_featured ).to.be.true;
	} );
} );
