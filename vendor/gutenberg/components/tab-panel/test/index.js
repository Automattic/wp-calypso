/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import TabPanel from '../';

describe( 'TabPanel', () => {
	describe( 'basic rendering', () => {
		it( 'should render a tabpanel, and clicking should change tabs', () => {
			const wrapper = mount(
				<TabPanel className="test-panel"
					activeClass="active-tab"
					tabs={
						[
							{
								name: 'alpha',
								title: 'Alpha',
								className: 'alpha',
							},
							{
								name: 'beta',
								title: 'Beta',
								className: 'beta',
							},
							{
								name: 'gamma',
								title: 'Gamma',
								className: 'gamma',
							},
						]
					}
				>
					{
						( tabName ) => {
							return <p tabIndex="0" className={ tabName + '-view' }>{ tabName }</p>;
						}
					}
				</TabPanel>
			);

			const alphaTab = wrapper.find( 'button.alpha' );
			const betaTab = wrapper.find( 'button.beta' );
			const gammaTab = wrapper.find( 'button.gamma' );

			const getAlphaView = () => wrapper.find( 'p.alpha-view' );
			const getBetaView = () => wrapper.find( 'p.beta-view' );
			const getGammaView = () => wrapper.find( 'p.gamma-view' );

			const getActiveTab = () => wrapper.find( 'button.active-tab' );
			const getActiveView = () => wrapper.find( 'div[role="tabpanel"]' );

			expect( getActiveTab().text() ).toBe( 'Alpha' );
			expect( getAlphaView() ).toHaveLength( 1 );
			expect( getBetaView() ).toHaveLength( 0 );
			expect( getGammaView() ).toHaveLength( 0 );
			expect( getActiveView().text() ).toBe( 'alpha' );

			betaTab.simulate( 'click' );
			expect( getActiveTab().text() ).toBe( 'Beta' );
			expect( getAlphaView() ).toHaveLength( 0 );
			expect( getBetaView() ).toHaveLength( 1 );
			expect( getGammaView() ).toHaveLength( 0 );
			expect( getActiveView().text() ).toBe( 'beta' );

			betaTab.simulate( 'click' );
			expect( getActiveTab().text() ).toBe( 'Beta' );
			expect( getAlphaView() ).toHaveLength( 0 );
			expect( getBetaView() ).toHaveLength( 1 );
			expect( getGammaView() ).toHaveLength( 0 );
			expect( getActiveView().text() ).toBe( 'beta' );

			gammaTab.simulate( 'click' );
			expect( getActiveTab().text() ).toBe( 'Gamma' );
			expect( getAlphaView() ).toHaveLength( 0 );
			expect( getBetaView() ).toHaveLength( 0 );
			expect( getGammaView() ).toHaveLength( 1 );
			expect( getActiveView().text() ).toBe( 'gamma' );

			alphaTab.simulate( 'click' );
			expect( getActiveTab().text() ).toBe( 'Alpha' );
			expect( getAlphaView() ).toHaveLength( 1 );
			expect( getBetaView() ).toHaveLength( 0 );
			expect( getGammaView() ).toHaveLength( 0 );
			expect( getActiveView().text() ).toBe( 'alpha' );
		} );
	} );

	it( 'should render with a tab initially selected by prop initialTabIndex', () => {
		const wrapper = mount(
			<TabPanel
				className="test-panel"
				activeClass="active-tab"
				initialTabName="beta"
				tabs={
					[
						{
							name: 'alpha',
							title: 'Alpha',
							className: 'alpha',
						},
						{
							name: 'beta',
							title: 'Beta',
							className: 'beta',
						},
					]
				}
			>
				{
					( tabName ) => {
						return <p tabIndex="0" className={ tabName + '-view' }>{ tabName }</p>;
					}
				}
			</TabPanel>
		);

		const getActiveTab = () => wrapper.find( 'button.active-tab' );
		expect( getActiveTab().text() ).toBe( 'Beta' );
	} );
} );
