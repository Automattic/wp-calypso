/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import useMockery from 'test/helpers/use-mockery';

describe( 'PropsViewer', () => {
	let PropsViewer;
	useMockery( ( mockery ) => {
		mockery.registerMock( '../../../server/devdocs/proptypes-index.json', [
			{
				description: 'Renders a table of prop-types for auto-documentation',
				displayName: 'PropsViewer',
				methods: [
					{
						name: 'renderRow',
						docblock: 'Renders a row in the table\n' +
						'@param {object} component The component\n' +
						'@param {string} propName The name of the prop to render\n' +
						'@return {ReactElement} The rendered row',
						modifiers: [],
						params: [
							{
								name: 'component',
								description: 'The component',
								type: {
									name: 'object'
								}
							},
							{
								name: 'propName',
								description: 'The name of the prop to render',
								type: {
									name: 'string'
								}
							}
						],
						returns: {
							description: 'The rendered row',
							type: {
								name: 'ReactElement'
							}
						},
						description: 'Renders a row in the table'
					},
					{
						name: 'renderTable',
						docblock: 'Renders a table if it can\n' +
						'@param {object} component The component to render for\n' +
						'@return {ReactComponent|null} The table or nothing',
						modifiers: [],
						params: [
							{
								name: 'component',
								description: 'The component to render for',
								type: {
									name: 'object'
								}
							}
						],
						returns: {
							description: 'The table or nothing',
							type: {
								name: 'union',
								value: [
									'ReactComponent',
									null
								]
							}
						},
						description: 'Renders a table if it can'
					}
				],
				props: {
					component: {
						type: {
							name: 'string'
						},
						required: true,
						description: 'The slug of the component being displayed'
					},
					example: {
						type: {
							name: 'element'
						},
						required: true,
						description: 'The element to display as an example of this component'
					}
				},
				includePath: 'blocks/props-viewer',
				slug: 'props-viewer'
			}
		] );
		PropsViewer = require( '../index' );
	} );

	context( 'no matching component', () => {
		it( 'should render only the example', () => {
			const component = ( <PropsViewer.default component={ 'no-match-here-go-away' } example={ <div /> } /> );
			const wrapper = shallow( component );
			expect( wrapper.childAt( 0 ).matchesElement( <div></div> ) ).to.be.true;
		} );
	} );

	context( 'renders a table of propTypes', () => {
		it( 'can render itself', () => {
			const example = ( <div>Example goes here</div> );
			const component = ( <PropsViewer.default component={ 'props-viewer' } example={ example } /> );
			const componentDescription = PropsViewer.findRealComponent( 'props-viewer' )[ 0 ];

			const wrapper = shallow( component );
			expect( wrapper.childAt( 0 ).matchesElement( <div>Example goes here</div> ) ).to.be.true;

			const tableWrapper = wrapper.childAt( 1 );
			expect( tableWrapper.childAt( 0 ).text() ).equals( componentDescription.description );

			const tbody = wrapper.find( 'tbody' );
			const componentRow = tbody.childAt( 0 );

			expect( componentRow.childAt( 1 ).text() ).equals( 'component' );
			expect( componentRow.childAt( 2 ).text() ).equals( componentDescription.props.component.type.name );
			expect( componentRow.childAt( 3 ).text() ).equals( 'undefined' );
			expect( componentRow.childAt( 4 ).text() ).equals( componentDescription.props.component.description );
		} );
	} );

	context( 'reducer', () => {
		it( 'returns empty array if nothing is found', () => {
			const description = PropsViewer.findRealComponent( 'no-results' );
			expect( description ).to.be.empty;
		} );
		it( 'returns an item if something is found', () => {
			const description = PropsViewer.findRealComponent( 'props-viewer' );
			expect( description.length ).to.equal( 1 );
		} );
	} );
} );
