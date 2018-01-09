/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import merge from 'lodash/merge';

function createContext( additonalProps = {} ) {
	return merge(
		{
			head: {
				metas: [],
				links: [],
			},
			urls: {
				manifest: 'arbitrary-manifest-path',
				vendor: 'arbitrary-vendor-path',
				build: 'arbitrary-build-path',
				chunk: 'arbitrary-chunk-path',
			},
			jsFile: 'build',
			lang: 'en',
			isRtl: false,
			isFluidWidth: false,
			faviconUrl: 'https://arbitrary-favicon-url',
			shouldUseSingleCDN: false,
			env: 'development',
			isDebug: true,
			shouldUsePreconnect: false,
			shouldUsePreconnectGoogle: false,
			shouldUseStylePreloadExternal: false,
			shouldUseStylePreloadSection: false,
			shouldUseStylePreloadCommon: false,
			shouldUseScriptPreload: false,
			i18nLocaleScript: 'https://arbitrary-i18n-locale-script-url',
			sectionCss: {
				urls: [],
			},
			chunk: 'chunk',
			renderedLayout: '',
			sectionGroup: 'reader',
			hasSecondary: true,
			user: {},
			app: {},
			initialReduxState: {},
			config: 'var config = {}',
		},
		additonalProps
	);
}

describe( 'Document', () => {
	let Document;

	beforeAll( () => {
		Document = require( '../index.jsx' );
	} );

	describe( '<html />', () => {
		test( 'should render with default props', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			const html = wrapper.find( 'html' );
			expect( html.prop( 'lang' ) ).to.eql( 'en' );
			expect( html.prop( 'dir' ) ).to.eql( 'ltr' );
			expect( html ).to.have.className( '' );
		} );

		test( 'should render with custom props', () => {
			const props = createContext( {
				lang: 'de',
				isRtl: true,
				isFluidWidth: true,
			} );
			const wrapper = shallow( <Document { ...props } /> );

			const html = wrapper.find( 'html' );
			expect( html.prop( 'lang' ) ).to.eql( 'de' );
			expect( html.prop( 'dir' ) ).to.eql( 'rtl' );
			expect( html ).to.have.className( 'is-fluid-width' );
		} );
	} );

	describe( '<title />', () => {
		test( 'should render default title', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( 'title' ) ).to.have.text( 'WordPress.com' );
		} );

		test( 'should render custom title', () => {
			const props = createContext( { head: { title: 'arbitrary custom title' } } );
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( 'title' ) ).to.have.text( 'arbitrary custom title' );
		} );
	} );

	describe( 'additional <meta /> tags', () => {
		test( 'should render any additional meta tags', () => {
			const props = createContext( {
				head: {
					metas: [
						{
							name: 'arbitrary-meta-tag-name-1',
							property: 'arbitrary-meta-tag-prop-1',
							content: 'arbitrary-meta-tag-content-1',
						},
						{
							name: 'arbitrary-meta-tag-name-2',
							property: 'arbitrary-meta-tag-prop-2',
							content: 'arbitrary-meta-tag-content-2',
						},
					],
				},
			} );
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper ).to.have.descendants( props.head.metas[ 0 ] );
			expect( wrapper ).to.have.descendants( props.head.metas[ 1 ] );
		} );
	} );

	describe( ' additional <link /> tags', () => {
		test( 'should render any additional link tags', () => {
			const props = createContext( {
				head: {
					links: [
						{
							rel: 'arbitrary-link-rel-1',
							href: '//arbitrary-link-href-1',
						},
						{
							rel: 'arbitrary-link-rel-2',
							href: '//arbitrary-link-href-2',
						},
					],
				},
			} );
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper ).to.have.descendants( props.head.links[ 0 ] );
			expect( wrapper ).to.have.descendants( props.head.links[ 1 ] );
		} );
	} );

	describe( 'favicons', () => {
		test( 'should render correct faviconUrls for relevant link tags', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			expect(
				wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' )
			).to.equal( props.faviconUrl );
			expect(
				wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' )
			).to.equal( props.faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal(
				props.faviconUrl
			);
		} );
	} );

	describe( '<body />', () => {
		test( 'should apply rtl className', () => {
			const props = createContext( { isRtl: true } );
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( 'body' ) ).to.have.className( 'rtl' );
		} );

		test( 'should not apply rtl className', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( 'body' ) ).to.have.className( '' );
		} );
	} );

	describe( 'skeleton (inside body)', () => {
		test( 'should include "renderedLayout" (html string) when given', () => {
			const props = createContext( { renderedLayout: '<div>arbitrary html string</div>' } );
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( '#wpcom' ).prop( 'dangerouslySetInnerHTML' ) ).to.eql( {
				__html: '<div>arbitrary html string</div>',
			} );
		} );

		test( 'should render a basic app skeleton', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			// sectionGroup = 'reader'
			expect( wrapper.find( '#wpcom' ) ).to.have.descendants( '.layout.is-group-reader' );

			expect( wrapper.find( '.layout' ) ).to.have.descendants( 'Masterbar' );
			expect( wrapper.find( '.layout__content' ) ).to.have.descendants( 'div.wpcom-site__logo' );

			// hasSecondary = true
			expect( wrapper.find( '.layout__content' ) ).to.have.descendants( 'div.layout__secondary' );
			expect( wrapper.find( '.layout__content' ) ).to.have.descendants( 'ul.sidebar' );

			// sectionGroup !== 'editor'
			expect( wrapper.find( '.layout__content' ) ).to.not.have.descendants(
				'.editor-ground-control'
			);
		} );
	} );

	describe( '<no|script /> tags', () => {
		test.skip( 'should render a <script /> tag including user data', () => {} );

		test.skip( 'should render a <script /> tag for including app data', () => {} );

		test.skip( 'should render a <script /> tag for including the initial redux state', () => {} );

		test.skip( 'should render a <script /> tag including configuration data', () => {} );

		test( 'should render a <script /> tag for all relevant script files', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper ).to.have.descendants( `script[src="${ props.urls.manifest }"]` );
			expect( wrapper ).to.have.descendants( `script[src="${ props.urls.vendor }"]` );
			expect( wrapper ).to.have.descendants( `script[src="${ props.urls[ props.jsFile ] }"]` );
			expect( wrapper ).to.have.descendants( `script[src="${ props.urls[ props.chunk ] }"]` );
		} );

		test( 'last <script /> tag should call AppBoot() on window', () => {
			const props = createContext();
			const wrapper = shallow( <Document { ...props } /> );

			expect( wrapper.find( 'script' ).last() ).to.have.text( 'window.AppBoot();' );
		} );
	} );
} );
