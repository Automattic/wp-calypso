/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import RenderSwitch from 'calypso/components/jetpack/render-switch';

describe( 'RenderSwitch', () => {
	test( 'if loadingCondition is true, renders the loading and query components', () => {
		const loading = <span>loading</span>;
		const query = <span>query</span>;

		const renderSwitch = shallow(
			<RenderSwitch
				loadingCondition={ () => true }
				loadingComponent={ loading }
				queryComponent={ query }
			/>
		);

		expect( renderSwitch.contains( query ) ).toEqual( true );
		expect( renderSwitch.contains( loading ) ).toEqual( true );
	} );

	test( 'if loadingCondition is true but loadingComponent is undefined, skip rendering it', () => {
		const query = <span>query</span>;

		const renderSwitch = shallow(
			<RenderSwitch loadingCondition={ () => true } queryComponent={ query } />
		);

		expect( renderSwitch.contains( query ) ).toEqual( true );
	} );

	test( 'if loadingCondition is true but queryComponent is undefined, skip rendering it', () => {
		const loading = <span>loading</span>;

		const renderSwitch = shallow(
			<RenderSwitch loadingCondition={ () => true } loadingComponent={ loading } />
		);

		expect( renderSwitch.contains( loading ) ).toEqual( true );
	} );

	test( 'if loadingCondition is false and renderCondition is true, renders only trueComponent', () => {
		const trueComponent = <span>true</span>;
		const falseComponent = <span>false</span>;

		const renderSwitch = shallow(
			<RenderSwitch
				loadingCondition={ () => false }
				renderCondition={ () => true }
				trueComponent={ trueComponent }
				falseComponent={ falseComponent }
			/>
		);

		expect( renderSwitch.contains( trueComponent ) ).toEqual( true );
		expect( renderSwitch.contains( falseComponent ) ).toEqual( false );
	} );

	test( 'if loadingCondition is false and renderCondition is false, renders only falseComponent', () => {
		const trueComponent = <span>true</span>;
		const falseComponent = <span>false</span>;

		const renderSwitch = shallow(
			<RenderSwitch
				loadingCondition={ () => false }
				renderCondition={ () => false }
				trueComponent={ trueComponent }
				falseComponent={ falseComponent }
			/>
		);

		expect( renderSwitch.contains( trueComponent ) ).toEqual( false );
		expect( renderSwitch.contains( falseComponent ) ).toEqual( true );
	} );

	test( 'if trueComponent should render but is undefined, return null', () => {
		const renderSwitch = shallow(
			<RenderSwitch loadingCondition={ () => false } renderCondition={ () => true } />
		);

		expect( renderSwitch.html() ).toBeNull();
	} );

	test( 'if falseComponent should render but is undefined, return null', () => {
		const renderSwitch = shallow(
			<RenderSwitch loadingCondition={ () => false } renderCondition={ () => false } />
		);

		expect( renderSwitch.html() ).toBeNull();
	} );
} );
