/**
 * External dependencies
 */
import Chai from 'chai';
import sinonChai from 'sinon-chai';
import nock from 'nock';

// These act like global before / after lifecycle bits
before( () => {
	Chai.use( sinonChai );
	nock.disableNetConnect();
} );

after( () => {
	nock.cleanAll();
	nock.enableNetConnect();
	nock.restore();
} );

function requireTestFiles( config, path = '' ) {
	Object.keys( config ).map( ( folderName ) => {
		const folderConfig = config[ folderName ];

		if ( folderName === 'test' ) {
			folderConfig.forEach( fileName => require( `${path}test/${fileName}.js` ) );
		} else {
			describe( folderName, () => {
				requireTestFiles( folderConfig, `${path}${folderName}/` );
			} );
		}
	} );
}

requireTestFiles( {
	lib: {
		domains: {
			dns: {
				test: [ 'index-test', 'reducer-test' ]
			},
			'email-forwarding': {
				test: [ 'reducer-test', 'store-test' ]
			},
			nameservers: {
				test: [ 'store-test' ]
			},
			test: [ 'assembler-test' ],
			whois: {
				test: [ 'assembler-test', 'store-test' ]
			}
		},
		'post-formats': {
			test: [ 'actions', 'store' ]
		},
		'post-metadata': {
			test: [ 'index' ]
		},
		'post-normalizer': {
			test: [ 'index' ]
		},
		posts: {
			test: [ 'actions', 'post-edit-store', 'post-list-store', 'utils' ]
		},
		store: {
			test: [ 'index-test' ]
		}
	},
	state: {
		application: {
			test: [ 'actions', 'reducer' ]
		},
		comments: {
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		'current-user': {
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		notices: {
			test: [ 'actions', 'reducer' ]
		},
		plugins: {
			wporg: {
				test: [ 'reducer', 'test-actions', 'test-selectors' ]
			}
		},
		'post-types': {
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		posts: {
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		receipts: {
			test: [ 'reducer' ]
		},
		sharing: {
			publicize: {
				test: [ 'actions', 'reducer', 'selectors' ]
			}
		},
		'site-settings': {
			exporter: {
				test: [ 'actions', 'reducer', 'selectors' ]
			}
		},
		sites: {
			plans: {
				test: [ 'actions', 'reducer' ]
			},
			test: [ 'actions', 'reducer' ]
		},
		support: {
			test: [ 'actions', 'reducer' ]
		},
		themes: {
			'current-theme': {
				test: [ 'index', 'reducer' ]
			},
			'theme-details': {
				test: [ 'reducer', 'selectors' ]
			},
			themes: {
				test: [ 'index', 'reducer' ]
			},
			'themes-last-query': {
				test: [ 'reducer' ]
			},
			'themes-list': {
				test: [ 'index', 'reducer' ]
			}
		},
		ui: {
			editor: {
				'contact-form': {
					test: [ 'actions', 'reducer' ]
				}
			},
			reader: {
				fullpost: {
					test: [ 'actions', 'reducer' ]
				}
			},
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		users: {
			test: [ 'actions', 'reducer', 'selectors' ]
		},
		test: [ 'index' ]
	}
} );
