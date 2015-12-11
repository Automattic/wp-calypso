import setup from 'lib/react-test-env-setup';
setup();

import moment from 'moment';
import sinonChai from 'sinon-chai';
import ReactDom from 'react-dom';
import React from 'react/addons';
import chai from 'chai';
import identity from 'lodash/utility/identity';
import i18n from 'lib/mixins/i18n';
import domainConstants from 'lib/domains/constants';

const domainTypes = domainConstants.type;

const TestUtils = React.addons.TestUtils;
import Notice from 'components/notice';

chai.use( sinonChai );

let DomainWarnings, translateFn;
describe( 'DomainWarnings', () => {
	beforeEach( () => {
		translateFn = i18n.translate;
		i18n.translate = identity;
		DomainWarnings = require( '../' );
		DomainWarnings.prototype.__reactAutoBindMap.translate = identity;
		Notice.prototype.__reactAutoBindMap.translate = identity;
	} );

	afterEach( () => {
		delete DomainWarnings.prototype.__reactAutoBindMap.translate;
		delete Notice.prototype.__reactAutoBindMap.translate;
		i18n.translate = translateFn;
	} );

	it( 'should not render anything if there\'s no need', () => {
		let domain = {
			name: 'example.com'
		};

		let component = TestUtils.renderIntoDocument( <DomainWarnings domain={ domain } /> );

		chai.expect( ReactDom.findDOMNode( component ) ).to.be.a( 'null' )
	} );

	it( 'should render new warning notice if the domain is new', () => {
		let props = {
			domain: {
				name: 'example.com',
				registrationMoment: moment(),
				type: domainTypes.REGISTERED
			},
			selectedSite: {domain: 'example.wordpress.com' }
		};

		let component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );
		chai.expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'We are setting up %(domainName)s for you' );
	} );

	it( 'should render the highest priority notice when there are others', () => {
		let props = {
			domain: {
				name: 'example.com',
				registrationMoment: moment(),
				type: domainTypes.REGISTERED
			},
			selectedSite: { domain: 'example.com' }
		};

		let component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		chai.expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'If you are unable to access your site at %(domainName)s' );
	} );

	it( 'should render the multi version of the component if more than two domains match the same rule', () => {
		let props = {
			domains: [
				{ name: '1.com', registrationMoment: moment(), type: domainTypes.REGISTERED },
				{ name: '2.com', registrationMoment: moment(), type: domainTypes.REGISTERED }
			],
			selectedSite: { domain: 'example.com' }
		};

		let component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		chai.expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'We are setting up your new domains for you' );
	} );

	describe( 'Mutations', () => {
		it( 'should not mutate domain objects', () => {
			let props = {
				domain: {
					name: '1.com',
					registrationMoment: moment( '1999-09-09', 'YYYY-MM-DD' ),
					expirationMoment: moment( '2000-09-09', 'YYYY-MM-DD' )
				},
				selectedSite: { domain: '1.com' }
			};

			TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			chai.expect( props.domain.name ).to.equal( '1.com' );
			chai.assert( props.domain.registrationMoment.isSame( moment( '1999-09-09', 'YYYY-MM-DD' ) ) );
			chai.assert( props.domain.expirationMoment.isSame( moment( '2000-09-09', 'YYYY-MM-DD' ) ) );
		} );
	} );

	describe( 'Ruleset filtering', () => {
		it( 'should only process whitelisted renderers', () => {
			let props = {
				domain: { name: 'example.com' },
				ruleWhiteList: []
			};

			let component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );
			chai.expect( component.getPipe().length ).to.equal( 0 );
		} );

		it( 'should not allow running extra functions other than defined in getPipe()', () => {
			let props = {
				domain: { name: 'example.com' },
				ruleWhiteList: [ 'getDomains' ]
			};

			let component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );
			chai.expect( component.getPipe().length ).to.equal( 0 );
		} );
	} );
} );
