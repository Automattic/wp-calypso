/**
 * External dependencies
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { execSync } from 'child_process';

/**
 * Internal dependencies
 */
import { BadgeBase, BranchName, DevDocsLink } from '../';

describe( 'Badge', function() {
	context( 'with environment set to production', function() {
		const wrapper = shallow( <BadgeBase env="production" /> );

		it( 'should return null', function() {
			expect( wrapper.type() ).to.be.null;
		} );
	} );

	context( 'with environment set to desktop', function() {
		const wrapper = shallow( <BadgeBase env="desktop" /> );

		it( 'should return null', function() {
			expect( wrapper.type() ).to.be.null;
		} );
	} );

	context( 'with environment set to stage', function() {
		const element = <BadgeBase env="stage" />;
		const wrapper = shallow( element );

		it( 'should not render a <div> with classes "environment" and "is-tests"', function() {
			expect( wrapper.find( 'div.environment.is-tests' ) ).to.have.length( 0 );
		} );

		it( 'should not render a BranchName component', function() {
			expect( wrapper.find( 'BranchName' ) ).to.have.length( 0 );
		} );

		it( 'should not render a DevDocsLink component', function() {
			expect( wrapper.find( 'DevDocsLink' ) ).to.have.length( 0 );
		} );

		it( 'should render a <span> with classes "environment" and "is-staging", and content "staging"', function() {
			expect( wrapper.find( 'span.environment.is-staging' ) ).to.have.length( 1 );
			expect( wrapper.find( 'span.environment.is-staging' ).text() ).to.equal( 'staging' );
		} );

		it( 'should render an <a> with class "bug-report", pointing to the correct URL', function() {
			expect( wrapper.find( 'a.bug-report' ) ).to.have.length( 1 );
			expect( wrapper.find( 'a.bug-report' ).prop( 'href' ) ).to.equal( 'https://github.com/Automattic/wp-calypso/issues/' );
		} );

		it( 'should renderToStaticMarkup() successfully', function() {
			const markup = renderToStaticMarkup( element );
			expect( markup ).to.equal( '<div class="environment-badge"><span class="environment is-staging">staging</span><a href="https://github.com/Automattic/wp-calypso/issues/" title="Report an issue" target="_blank" rel="noopener noreferrer" class="bug-report"></a></div>' );
		} );
	} );

	context( 'with environment set to horizon', function() {
		const element = <BadgeBase env="horizon" />;
		const wrapper = shallow( element );

		it( 'should not render a <div> with classes "environment" and "is-tests"', function() {
			expect( wrapper.find( 'div.environment.is-tests' ) ).to.have.length( 0 );
		} );

		it( 'should not render a BranchName component', function() {
			expect( wrapper.find( 'BranchName' ) ).to.have.length( 0 );
		} );

		it( 'should not render a DevDocsLink component', function() {
			expect( wrapper.find( 'DevDocsLink' ) ).to.have.length( 0 );
		} );

		it( 'should render a <span> with classes "environment" and "is-feedback", and content "feedback"', function() {
			expect( wrapper.find( 'span.environment.is-feedback' ) ).to.have.length( 1 );
			expect( wrapper.find( 'span.environment.is-feedback' ).text() ).to.equal( 'feedback' );
		} );

		it( 'should render an <a> with class "bug-report", pointing to the correct URL', function() {
			expect( wrapper.find( 'a.bug-report' ) ).to.have.length( 1 );
			expect( wrapper.find( 'a.bug-report' ).prop( 'href' ) ).to.equal( 'https://horizonfeedback.wordpress.com/' );
		} );

		it( 'should renderToStaticMarkup() successfully', function() {
			const markup = renderToStaticMarkup( element );
			expect( markup ).to.equal( '<div class="environment-badge"><span class="environment is-feedback">feedback</span><a href="https://horizonfeedback.wordpress.com/" title="Report an issue" target="_blank" rel="noopener noreferrer" class="bug-report"></a></div>' );
		} );
	} );

	context( 'with environment set to wpcalypso and testHelper set to true', function() {
		const element = <BadgeBase env="wpcalypso" testHelper={ true } />;
		const wrapper = shallow( element );

		it( 'should render a <div> with classes "environment" and "is-tests"', function() {
			expect( wrapper.find( 'div.environment.is-tests' ) ).to.have.length( 1 );
		} );

		it( 'should not render a BranchName component', function() {
			expect( wrapper.find( 'BranchName' ) ).to.have.length( 0 );
		} );

		it( 'should render a DevDocsLink component', function() {
			expect( wrapper.find( 'DevDocsLink' ) ).to.have.length( 1 );
		} );

		it( 'should render a <span> with classes "environment" and "is-wpcalypso", and content "wpcalypso"', function() {
			expect( wrapper.find( 'span.environment.is-wpcalypso' ) ).to.have.length( 1 );
			expect( wrapper.find( 'span.environment.is-wpcalypso' ).text() ).to.equal( 'wpcalypso' );
		} );

		it( 'should render an <a> with class "bug-report", pointing to the correct URL', function() {
			expect( wrapper.find( 'a.bug-report' ) ).to.have.length( 1 );
			expect( wrapper.find( 'a.bug-report' ).prop( 'href' ) ).to.equal( 'https://github.com/Automattic/wp-calypso/issues/' );
		} );

		it( 'should renderToStaticMarkup() successfully', function() {
			const markup = renderToStaticMarkup( element );
			expect( markup ).to.equal( '<div class="environment-badge"><div class="environment is-tests"></div><span class="environment is-docs"><a href="/devdocs" title="DevDocs">docs</a></span><span class="environment is-wpcalypso">wpcalypso</span><a href="https://github.com/Automattic/wp-calypso/issues/" title="Report an issue" target="_blank" rel="noopener noreferrer" class="bug-report"></a></div>' );
		} );
	} );

	context( 'with environment set to development and testHelper set to true', function() {
		const element = <BadgeBase env="development" testHelper={ true } />;
		const wrapper = shallow( element );

		it( 'should render a <div> with classes "environment" and "is-tests"', function() {
			expect( wrapper.find( 'div.environment.is-tests' ) ).to.have.length( 1 );
		} );

		it( 'should render a BranchName component', function() {
			expect( wrapper.find( 'BranchName' ) ).to.have.length( 1 );
		} );

		it( 'should render a DevDocsLink component', function() {
			expect( wrapper.find( 'DevDocsLink' ) ).to.have.length( 1 );
		} );

		it( 'should render a <span> with classes "environment" and "is-dev", and content "dev"', function() {
			expect( wrapper.find( 'span.environment.is-dev' ) ).to.have.length( 1 );
			expect( wrapper.find( 'span.environment.is-dev' ).text() ).to.equal( 'dev' );
		} );

		it( 'should render an <a> with class "bug-report", pointing to the correct URL', function() {
			expect( wrapper.find( 'a.bug-report' ) ).to.have.length( 1 );
			expect( wrapper.find( 'a.bug-report' ).prop( 'href' ) ).to.equal( 'https://github.com/Automattic/wp-calypso/issues/' );
		} );

		it( 'should renderToStaticMarkup() successfully', function() {
			const markup = renderToStaticMarkup( element );
			const branchName = execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().replace( /\s/gm, '' );
			const commitChecksum = execSync( 'git rev-parse --short HEAD' ).toString().replace( /\s/gm, '' );

			expect( markup ).to.equal( `<div class="environment-badge"><div class="environment is-tests"></div><span class="environment branch-name" title="Commit ${ commitChecksum }">${ branchName }</span><span class="environment is-docs"><a href="/devdocs" title="DevDocs">docs</a></span><span class="environment is-dev">dev</span><a href="https://github.com/Automattic/wp-calypso/issues/" title="Report an issue" target="_blank" rel="noopener noreferrer" class="bug-report"></a></div>` );
		} );
	} );
} );

describe( 'BranchName', function() {
	const wrapper = shallow( <BranchName /> );
	const branchName = execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().replace( /\s/gm, '' );
	const commitChecksum = execSync( 'git rev-parse --short HEAD' ).toString().replace( /\s/gm, '' );

	if ( branchName === 'master' ) {
		context( 'on the master branch', function() {
			it( 'should return null', function() {
				expect( wrapper.type() ).to.be.null;
			} );
		} );
	}

	if ( branchName !== 'master' ) {
		context( 'on a non-master branch', function() {
			it( 'should render a <span> with the correct classes, title, and containing the current branch\'s name', function() {
				expect( wrapper.find( 'span.environment.branch-name' ) ).to.have.length( 1 );
				expect( wrapper.find( 'span.environment.branch-name' ).prop( 'title' ) ).to.equal( 'Commit ' + commitChecksum );
				expect( wrapper.find( 'span.environment.branch-name' ).text() ).to.equal( branchName );
			} );
		} );
	}
} );

describe( 'DevDocsLink', function() {
	const wrapper = shallow( <DevDocsLink /> );
	it( 'should render a <span> with the correct classes, title, and containing a link to /devdocs', function() {
		expect( wrapper.find( 'span.environment.is-docs' ) ).to.have.length( 1 );
		expect( wrapper.find( 'span.environment.is-docs' ).find( 'a' ) ).to.have.length( 1 );
		expect( wrapper.find( 'span.environment.is-docs' ).find( 'a' ).prop( 'href' ) ).to.equal( '/devdocs' );
		expect( wrapper.find( 'span.environment.is-docs' ).find( 'a' ).prop( 'title' ) ).to.equal( 'DevDocs' );
		expect( wrapper.find( 'span.environment.is-docs' ).find( 'a' ).text() ).to.equal( 'docs' );
	} );
} );
