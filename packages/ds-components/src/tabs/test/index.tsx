/**
 * External dependencies
 */
import { screen, waitFor } from '@testing-library/react';
import { press, click } from '@ariakit/test';
import { render } from '@ariakit/test/react';

/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Tabs } from '..';
import type { TabsProps } from '../types';

// Setup mocking the `isRTL` function to test arrow key navigation behavior.
jest.mock( '@wordpress/i18n', () => {
	const original = jest.requireActual( '@wordpress/i18n' );
	return {
		...original,
		isRTL: jest.fn( () => false ),
	};
} );
const mockedIsRTL = isRTL as jest.Mock;

type Tab = {
	tabId: string;
	title: string;
	content: React.ReactNode;
	tab: {
		className?: string;
		disabled?: boolean;
	};
	tabpanel?: {
		focusable?: boolean;
	};
};

const TABS: Tab[] = [
	{
		tabId: 'alpha',
		title: 'Alpha',
		content: 'Selected tab: Alpha',
		tab: { className: 'alpha-class' },
	},
	{
		tabId: 'beta',
		title: 'Beta',
		content: 'Selected tab: Beta',
		tab: { className: 'beta-class' },
	},
	{
		tabId: 'gamma',
		title: 'Gamma',
		content: 'Selected tab: Gamma',
		tab: { className: 'gamma-class' },
	},
];

const TABS_WITH_ALPHA_DISABLED = TABS.map( ( tabObj ) =>
	tabObj.tabId === 'alpha'
		? {
				...tabObj,
				tab: {
					...tabObj.tab,
					disabled: true,
				},
		  }
		: tabObj
);

const TABS_WITH_BETA_DISABLED = TABS.map( ( tabObj ) =>
	tabObj.tabId === 'beta'
		? {
				...tabObj,
				tab: {
					...tabObj.tab,
					disabled: true,
				},
		  }
		: tabObj
);

const TABS_WITH_DELTA: Tab[] = [
	...TABS,
	{
		tabId: 'delta',
		title: 'Delta',
		content: 'Selected tab: Delta',
		tab: { className: 'delta-class' },
	},
];

const UncontrolledTabs = ( {
	tabs,
	...props
}: Omit< TabsProps, 'children' > & {
	tabs: Tab[];
} ) => {
	return (
		<Tabs { ...props }>
			<Tabs.TabList>
				{ tabs.map( ( tabObj ) => (
					<Tabs.Tab
						key={ tabObj.tabId }
						tabId={ tabObj.tabId }
						className={ tabObj.tab.className }
						disabled={ tabObj.tab.disabled }
					>
						{ tabObj.title }
					</Tabs.Tab>
				) ) }
			</Tabs.TabList>
			{ tabs.map( ( tabObj ) => (
				<Tabs.TabPanel
					key={ tabObj.tabId }
					tabId={ tabObj.tabId }
					focusable={ tabObj.tabpanel?.focusable }
				>
					{ tabObj.content }
				</Tabs.TabPanel>
			) ) }
		</Tabs>
	);
};

const ControlledTabs = ( {
	tabs,
	...props
}: Omit< TabsProps, 'children' > & {
	tabs: Tab[];
} ) => {
	const [ selectedTabId, setSelectedTabId ] = useState<
		string | undefined | null
	>( props.selectedTabId );

	useEffect( () => {
		setSelectedTabId( props.selectedTabId );
	}, [ props.selectedTabId ] );

	return (
		<Tabs
			{ ...props }
			selectedTabId={ selectedTabId }
			onSelect={ ( selectedId ) => {
				setSelectedTabId( selectedId );
				props.onSelect?.( selectedId );
			} }
		>
			<Tabs.TabList>
				{ tabs.map( ( tabObj ) => (
					<Tabs.Tab
						key={ tabObj.tabId }
						tabId={ tabObj.tabId }
						className={ tabObj.tab.className }
						disabled={ tabObj.tab.disabled }
					>
						{ tabObj.title }
					</Tabs.Tab>
				) ) }
			</Tabs.TabList>
			{ tabs.map( ( tabObj ) => (
				<Tabs.TabPanel
					key={ tabObj.tabId }
					tabId={ tabObj.tabId }
					focusable={ tabObj.tabpanel?.focusable }
				>
					{ tabObj.content }
				</Tabs.TabPanel>
			) ) }
		</Tabs>
	);
};

let originalGetClientRects: () => DOMRectList;

async function waitForComponentToBeInitializedWithSelectedTab(
	selectedTabName: string | undefined
) {
	if ( ! selectedTabName ) {
		// Wait for the tablist to be tabbable as a mean to know
		// that ariakit has finished initializing.
		await waitFor( () =>
			expect( screen.getByRole( 'tablist' ) ).toHaveAttribute(
				'tabindex',
				expect.stringMatching( /^(0|-1)$/ )
			)
		);
		// No initially selected tabs or tabpanels.
		await waitFor( () =>
			expect(
				screen.queryByRole( 'tab', { selected: true } )
			).not.toBeInTheDocument()
		);
		await waitFor( () =>
			expect( screen.queryByRole( 'tabpanel' ) ).not.toBeInTheDocument()
		);
	} else {
		// Waiting for a tab to be selected is a sign that the component
		// has fully initialized.
		expect(
			await screen.findByRole( 'tab', {
				selected: true,
				name: selectedTabName,
			} )
		).toBeVisible();
		// The corresponding tabpanel is also shown.
		expect(
			screen.getByRole( 'tabpanel', {
				name: selectedTabName,
			} )
		).toBeVisible();
	}
}

describe( 'Tabs', () => {
	beforeAll( () => {
		originalGetClientRects = window.HTMLElement.prototype.getClientRects;
		// Mocking `getClientRects()` is necessary to pass a check performed by
		// the `focus.tabbable.find()` and by the `focus.focusable.find()` functions
		// from the `@wordpress/dom` package.
		// @ts-expect-error We're not trying to comply to the DOM spec, only mocking
		window.HTMLElement.prototype.getClientRects = function () {
			return [ 'trick-jsdom-into-having-size-for-element-rect' ];
		};
	} );

	afterAll( () => {
		window.HTMLElement.prototype.getClientRects = originalGetClientRects;
	} );

	describe( 'Adherence to spec and basic behavior', () => {
		it( 'should apply the correct roles, semantics and attributes', async () => {
			await render( <UncontrolledTabs tabs={ TABS } /> );

			// Alpha is automatically selected as the selected tab.
			await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

			const tabList = screen.getByRole( 'tablist' );
			const allTabs = screen.getAllByRole( 'tab' );
			const allTabpanels = screen.getAllByRole( 'tabpanel' );

			expect( tabList ).toBeVisible();
			expect( tabList ).toHaveAttribute(
				'aria-orientation',
				'horizontal'
			);

			expect( allTabs ).toHaveLength( TABS.length );

			// Only 1 tab panel is accessible — the one associated with the
			// selected tab. The selected `tab` aria-controls the active
			/// `tabpanel`, which is `aria-labelledby` the selected `tab`.
			expect( allTabpanels ).toHaveLength( 1 );

			expect( allTabpanels[ 0 ] ).toBeVisible();
			expect( allTabs[ 0 ] ).toHaveAttribute(
				'aria-controls',
				allTabpanels[ 0 ].getAttribute( 'id' )
			);
			expect( allTabpanels[ 0 ] ).toHaveAttribute(
				'aria-labelledby',
				allTabs[ 0 ].getAttribute( 'id' )
			);
		} );

		it( 'should associate each `tab` with the correct `tabpanel`, even if they are not rendered in the same order', async () => {
			const TABS_WITH_DELTA_REVERSED = [ ...TABS_WITH_DELTA ].reverse();

			await render(
				<Tabs>
					<Tabs.TabList>
						{ TABS_WITH_DELTA.map( ( tabObj ) => (
							<Tabs.Tab
								key={ tabObj.tabId }
								tabId={ tabObj.tabId }
								className={ tabObj.tab.className }
								disabled={ tabObj.tab.disabled }
							>
								{ tabObj.title }
							</Tabs.Tab>
						) ) }
					</Tabs.TabList>
					{ TABS_WITH_DELTA_REVERSED.map( ( tabObj ) => (
						<Tabs.TabPanel
							key={ tabObj.tabId }
							tabId={ tabObj.tabId }
							focusable={ tabObj.tabpanel?.focusable }
						>
							{ tabObj.content }
						</Tabs.TabPanel>
					) ) }
				</Tabs>
			);

			// Alpha is automatically selected as the selected tab.
			await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

			// Select Beta, make sure the correct tabpanel is rendered
			await click( screen.getByRole( 'tab', { name: 'Beta' } ) );
			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Beta',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Beta',
				} )
			).toBeVisible();

			// Select Gamma, make sure the correct tabpanel is rendered
			await click( screen.getByRole( 'tab', { name: 'Gamma' } ) );
			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Gamma',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Gamma',
				} )
			).toBeVisible();

			// Select Delta, make sure the correct tabpanel is rendered
			await click( screen.getByRole( 'tab', { name: 'Delta' } ) );
			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Delta',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Delta',
				} )
			).toBeVisible();
		} );

		it( "should apply the tab's `className` to the tab button", async () => {
			await render( <UncontrolledTabs tabs={ TABS } /> );

			// Alpha is automatically selected as the selected tab.
			await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

			expect(
				await screen.findByRole( 'tab', { name: 'Alpha' } )
			).toHaveClass( 'alpha-class' );
			expect( screen.getByRole( 'tab', { name: 'Beta' } ) ).toHaveClass(
				'beta-class'
			);
			expect( screen.getByRole( 'tab', { name: 'Gamma' } ) ).toHaveClass(
				'gamma-class'
			);
		} );
	} );

	describe( 'pointer interactions', () => {
		it( 'should select a tab when clicked', async () => {
			const mockOnSelect = jest.fn();

			await render(
				<UncontrolledTabs tabs={ TABS } onSelect={ mockOnSelect } />
			);

			// Alpha is automatically selected as the selected tab.
			await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Click on Beta, make sure beta is the selected tab
			await click( screen.getByRole( 'tab', { name: 'Beta' } ) );

			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Beta',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Beta',
				} )
			).toBeVisible();

			expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

			// Click on Alpha, make sure alpha is the selected tab
			await click( screen.getByRole( 'tab', { name: 'Alpha' } ) );

			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Alpha',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Alpha',
				} )
			).toBeVisible();

			expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
		} );

		it( 'should not select a disabled tab when clicked', async () => {
			const mockOnSelect = jest.fn();

			await render(
				<UncontrolledTabs
					tabs={ TABS_WITH_BETA_DISABLED }
					onSelect={ mockOnSelect }
				/>
			);

			// Alpha is automatically selected as the selected tab.
			await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

			// Clicking on Beta does not result in beta being selected
			// because the tab is disabled.
			await click( screen.getByRole( 'tab', { name: 'Beta' } ) );

			expect(
				screen.getByRole( 'tab', {
					selected: true,
					name: 'Alpha',
				} )
			).toBeVisible();
			expect(
				screen.getByRole( 'tabpanel', {
					name: 'Alpha',
				} )
			).toBeVisible();

			expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'initial tab selection', () => {
		describe( 'when a selected tab id is not specified', () => {
			describe( 'when left `undefined` [Uncontrolled]', () => {
				it( 'should choose the first tab as selected', async () => {
					await render( <UncontrolledTabs tabs={ TABS } /> );

					// Alpha is automatically selected as the selected tab.
					await waitForComponentToBeInitializedWithSelectedTab(
						'Alpha'
					);

					// Press tab. The selected tab (alpha) received focus.
					await press.Tab();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Alpha',
						} )
					).toHaveFocus();
				} );

				it( 'should choose the first non-disabled tab if the first tab is disabled', async () => {
					await render(
						<UncontrolledTabs tabs={ TABS_WITH_ALPHA_DISABLED } />
					);

					// Beta is automatically selected as the selected tab, since alpha is
					// disabled.
					await waitForComponentToBeInitializedWithSelectedTab(
						'Beta'
					);

					// Press tab. The selected tab (beta) received focus. The corresponding
					// tabpanel is shown.
					await press.Tab();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toHaveFocus();
				} );
			} );
			describe( 'when `null` [Controlled]', () => {
				it( 'should not have a selected tab nor show any tabpanels, make the tablist tabbable and still allow selecting tabs', async () => {
					await render(
						<ControlledTabs tabs={ TABS } selectedTabId={ null } />
					);

					// No initially selected tabs or tabpanels.
					await waitForComponentToBeInitializedWithSelectedTab(
						undefined
					);

					// Press tab. The tablist receives focus
					await press.Tab();
					expect(
						await screen.findByRole( 'tablist' )
					).toHaveFocus();

					// Press right arrow to select the first tab (alpha) and
					// show the related tabpanel.
					await press.ArrowRight();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Alpha',
						} )
					).toHaveFocus();
					expect(
						await screen.findByRole( 'tabpanel', {
							name: 'Alpha',
						} )
					).toBeVisible();
				} );
			} );
		} );

		describe( 'when a selected tab id is specified', () => {
			describe( 'through the `defaultTabId` prop [Uncontrolled]', () => {
				it( 'should select the initial tab matching the `defaultTabId` prop', async () => {
					await render(
						<UncontrolledTabs tabs={ TABS } defaultTabId="beta" />
					);

					// Beta is the initially selected tab
					await waitForComponentToBeInitializedWithSelectedTab(
						'Beta'
					);

					// Press tab. The selected tab (beta) received focus. The corresponding
					// tabpanel is shown.
					await press.Tab();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toHaveFocus();
				} );

				it( 'should select the initial tab matching the `defaultTabId` prop even if the tab is disabled', async () => {
					await render(
						<UncontrolledTabs
							tabs={ TABS_WITH_BETA_DISABLED }
							defaultTabId="beta"
						/>
					);

					// Beta is automatically selected as the selected tab despite being
					// disabled, respecting the `defaultTabId` prop.
					await waitForComponentToBeInitializedWithSelectedTab(
						'Beta'
					);

					// Press tab. The selected tab (beta) received focus, since it is
					// accessible despite being disabled.
					await press.Tab();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toHaveFocus();
				} );

				it( 'should not have a selected tab nor show any tabpanels, but allow tabbing to the first tab when `defaultTabId` prop does not match any known tab', async () => {
					await render(
						<UncontrolledTabs
							tabs={ TABS }
							defaultTabId="non-existing-tab"
						/>
					);

					// No initially selected tabs or tabpanels, since the `defaultTabId`
					// prop is not matching any known tabs.
					await waitForComponentToBeInitializedWithSelectedTab(
						undefined
					);

					// Press tab. The first tab receives focus, but it's
					// not selected.
					await press.Tab();
					expect(
						screen.getByRole( 'tab', { name: 'Alpha' } )
					).toHaveFocus();
					await waitFor( () =>
						expect(
							screen.queryByRole( 'tab', { selected: true } )
						).not.toBeInTheDocument()
					);
					await waitFor( () =>
						expect(
							screen.queryByRole( 'tabpanel' )
						).not.toBeInTheDocument()
					);

					// Press right arrow to select the next tab (beta) and
					// show the related tabpanel.
					await press.ArrowRight();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toHaveFocus();
					expect(
						await screen.findByRole( 'tabpanel', {
							name: 'Beta',
						} )
					).toBeVisible();
				} );

				it( 'should not have a selected tab nor show any tabpanels, but allow tabbing to the first tab, even when disabled, when `defaultTabId` prop does not match any known tab', async () => {
					await render(
						<UncontrolledTabs
							tabs={ TABS_WITH_ALPHA_DISABLED }
							defaultTabId="non-existing-tab"
						/>
					);

					// No initially selected tabs or tabpanels, since the `defaultTabId`
					// prop is not matching any known tabs.
					await waitForComponentToBeInitializedWithSelectedTab(
						undefined
					);

					// Press tab. The first tab receives focus, but it's
					// not selected.
					await press.Tab();
					expect(
						screen.getByRole( 'tab', { name: 'Alpha' } )
					).toHaveFocus();
					await waitFor( () =>
						expect(
							screen.queryByRole( 'tab', { selected: true } )
						).not.toBeInTheDocument()
					);
					await waitFor( () =>
						expect(
							screen.queryByRole( 'tabpanel' )
						).not.toBeInTheDocument()
					);

					// Press right arrow to select the next tab (beta) and
					// show the related tabpanel.
					await press.ArrowRight();
					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toHaveFocus();
					expect(
						await screen.findByRole( 'tabpanel', {
							name: 'Beta',
						} )
					).toBeVisible();
				} );

				it( 'should ignore any changes to the `defaultTabId` prop after the first render', async () => {
					const mockOnSelect = jest.fn();

					const { rerender } = await render(
						<UncontrolledTabs
							tabs={ TABS }
							defaultTabId="beta"
							onSelect={ mockOnSelect }
						/>
					);

					// Beta is the initially selected tab
					await waitForComponentToBeInitializedWithSelectedTab(
						'Beta'
					);

					// Changing the defaultTabId prop to gamma should not have any effect.
					await rerender(
						<UncontrolledTabs
							tabs={ TABS }
							defaultTabId="gamma"
							onSelect={ mockOnSelect }
						/>
					);

					expect(
						await screen.findByRole( 'tab', {
							selected: true,
							name: 'Beta',
						} )
					).toBeVisible();
					expect(
						screen.getByRole( 'tabpanel', {
							name: 'Beta',
						} )
					).toBeVisible();

					expect( mockOnSelect ).not.toHaveBeenCalled();
				} );
			} );

			describe( 'through the `selectedTabId` prop [Controlled]', () => {
				describe( 'when the `selectedTabId` matches an existing tab', () => {
					it( 'should choose the initial tab matching the `selectedTabId`', async () => {
						await render(
							<ControlledTabs
								tabs={ TABS }
								selectedTabId="beta"
							/>
						);

						// Beta is the initially selected tab
						await waitForComponentToBeInitializedWithSelectedTab(
							'Beta'
						);

						// Press tab. The selected tab (beta) received focus, since it is
						// accessible despite being disabled.
						await press.Tab();
						expect(
							await screen.findByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();
					} );

					it( 'should choose the initial tab matching the `selectedTabId` even if a `defaultTabId` is passed', async () => {
						await render(
							<ControlledTabs
								tabs={ TABS }
								defaultTabId="beta"
								selectedTabId="gamma"
							/>
						);

						// Gamma is the initially selected tab
						await waitForComponentToBeInitializedWithSelectedTab(
							'Gamma'
						);

						// Press tab. The selected tab (gamma) received focus, since it is
						// accessible despite being disabled.
						await press.Tab();
						expect(
							await screen.findByRole( 'tab', {
								selected: true,
								name: 'Gamma',
							} )
						).toHaveFocus();
					} );

					it( 'should choose the initial tab matching the `selectedTabId` even if the tab is disabled', async () => {
						await render(
							<ControlledTabs
								tabs={ TABS_WITH_BETA_DISABLED }
								selectedTabId="beta"
							/>
						);

						// Beta is the initially selected tab
						await waitForComponentToBeInitializedWithSelectedTab(
							'Beta'
						);

						// Press tab. The selected tab (beta) received focus, since it is
						// accessible despite being disabled.
						await press.Tab();
						expect(
							await screen.findByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();
					} );
				} );

				describe( "when the `selectedTabId` doesn't match an existing tab", () => {
					it( 'should not have a selected tab nor show any tabpanels, but allow tabbing to the first tab', async () => {
						await render(
							<ControlledTabs
								tabs={ TABS }
								selectedTabId="non-existing-tab"
							/>
						);

						// No initially selected tabs or tabpanels, since the `selectedTabId`
						// prop is not matching any known tabs.
						await waitForComponentToBeInitializedWithSelectedTab(
							undefined
						);

						// Press tab. The first tab receives focus, but it's
						// not selected.
						await press.Tab();
						expect(
							screen.getByRole( 'tab', { name: 'Alpha' } )
						).toHaveFocus();
						await waitFor( () =>
							expect(
								screen.queryByRole( 'tab', { selected: true } )
							).not.toBeInTheDocument()
						);
						await waitFor( () =>
							expect(
								screen.queryByRole( 'tabpanel' )
							).not.toBeInTheDocument()
						);

						// Press right arrow to select the next tab (beta) and
						// show the related tabpanel.
						await press.ArrowRight();
						expect(
							await screen.findByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();
						expect(
							await screen.findByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();
					} );

					it( 'should not have a selected tab nor show any tabpanels, but allow tabbing to the first tab even when disabled', async () => {
						await render(
							<ControlledTabs
								tabs={ TABS_WITH_ALPHA_DISABLED }
								selectedTabId="non-existing-tab"
							/>
						);

						// No initially selected tabs or tabpanels, since the `selectedTabId`
						// prop is not matching any known tabs.
						await waitForComponentToBeInitializedWithSelectedTab(
							undefined
						);

						// Press tab. The first tab receives focus, but it's
						// not selected.
						await press.Tab();
						expect(
							screen.getByRole( 'tab', { name: 'Alpha' } )
						).toHaveFocus();
						await waitFor( () =>
							expect(
								screen.queryByRole( 'tab', { selected: true } )
							).not.toBeInTheDocument()
						);
						await waitFor( () =>
							expect(
								screen.queryByRole( 'tabpanel' )
							).not.toBeInTheDocument()
						);

						// Press right arrow to select the next tab (beta) and
						// show the related tabpanel.
						await press.ArrowRight();
						expect(
							await screen.findByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();
						expect(
							await screen.findByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();
					} );
				} );
			} );
		} );
	} );

	describe( 'keyboard interactions', () => {
		describe.each( [
			[ 'Uncontrolled', UncontrolledTabs ],
			[ 'Controlled', ControlledTabs ],
		] )( '[`%s`]', ( _mode, Component ) => {
			it( 'should handle the tablist as one tab stop', async () => {
				await render( <Component tabs={ TABS } /> );

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				// Press tab. The selected tab (alpha) received focus.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// By default the tabpanel should receive focus
				await press.Tab();
				expect(
					await screen.findByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toHaveFocus();
			} );

			it( 'should not focus the tabpanel container when its `focusable` property is set to `false`', async () => {
				await render(
					<Component
						tabs={ TABS.map( ( tabObj ) =>
							tabObj.tabId === 'alpha'
								? {
										...tabObj,
										content: (
											<>
												Selected Tab: Alpha
												<button>Alpha Button</button>
											</>
										),
										tabpanel: { focusable: false },
								  }
								: tabObj
						) }
					/>
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// In this case, the tabpanel container is skipped and focus is
				// moved directly to its contents
				await press.Tab();
				expect(
					await screen.findByRole( 'button', {
						name: 'Alpha Button',
					} )
				).toHaveFocus();
			} );

			it( 'should select tabs in the tablist when using the left and right arrow keys by default (automatic tab activation)', async () => {
				const mockOnSelect = jest.fn();

				await render(
					<Component tabs={ TABS } onSelect={ mockOnSelect } />
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Press the right arrow key to select the beta tab
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

				// Press the right arrow key to select the gamma tab
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Gamma',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Gamma',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

				// Press the left arrow key to select the beta tab
				await press.ArrowLeft();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 4 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );
			} );

			it( 'should not automatically select tabs in the tablist when pressing the left and right arrow keys if the `selectOnMove` prop is set to `false` (manual tab activation)', async () => {
				const mockOnSelect = jest.fn();

				await render(
					<Component
						tabs={ TABS }
						onSelect={ mockOnSelect }
						selectOnMove={ false }
					/>
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Press the right arrow key to move focus to the beta tab,
				// but without selecting it
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: false,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toBeVisible();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

				// Press the space key to click the beta tab, and select it.
				// The same should be true with any other mean of clicking the tab button
				// (ie. mouse click, enter key).
				await press.Space();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );
			} );

			it( 'should not select tabs in the tablist when using the up and down arrow keys, unless the `orientation` prop is set to `vertical`', async () => {
				const mockOnSelect = jest.fn();

				const { rerender } = await render(
					<Component tabs={ TABS } onSelect={ mockOnSelect } />
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Press the up arrow key, but the focused/selected tab does not change.
				await press.ArrowUp();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

				// Press the down arrow key, but the focused/selected tab does not change.
				await press.ArrowDown();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

				// Change the orientation to "vertical" and rerender the component.
				await rerender(
					<Component
						tabs={ TABS }
						onSelect={ mockOnSelect }
						orientation="vertical"
					/>
				);

				// Pressing the down arrow key now selects the next tab (beta).
				await press.ArrowDown();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

				// Pressing the up arrow key now selects the previous tab (alpha).
				await press.ArrowUp();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
			} );

			it( 'should loop tab focus at the end of the tablist when using arrow keys', async () => {
				const mockOnSelect = jest.fn();

				await render(
					<Component tabs={ TABS } onSelect={ mockOnSelect } />
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Press the left arrow key to loop around and select the gamma tab
				await press.ArrowLeft();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Gamma',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Gamma',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

				// Press the right arrow key to loop around and select the alpha tab
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );
			} );

			// TODO: mock writing direction to RTL
			it( 'should swap the left and right arrow keys when selecting tabs if the writing direction is set to RTL', async () => {
				// For this test only, mock the writing direction to RTL.
				mockedIsRTL.mockImplementation( () => true );

				const mockOnSelect = jest.fn();

				await render(
					<Component tabs={ TABS } onSelect={ mockOnSelect } />
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Press the left arrow key to select the beta tab
				await press.ArrowLeft();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

				// Press the left arrow key to select the gamma tab
				await press.ArrowLeft();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Gamma',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Gamma',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 3 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

				// Press the right arrow key to select the beta tab
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Beta',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 4 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'beta' );

				// Restore the original implementation of the isRTL function.
				mockedIsRTL.mockRestore();
			} );

			it( 'should focus tabs in the tablist even if disabled', async () => {
				const mockOnSelect = jest.fn();

				await render(
					<Component
						tabs={ TABS_WITH_BETA_DISABLED }
						onSelect={ mockOnSelect }
					/>
				);

				// Alpha is automatically selected as the selected tab.
				await waitForComponentToBeInitializedWithSelectedTab( 'Alpha' );

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

				// Focus the tablist (and the selected tab, alpha)
				// Tab should initially focus the first tab in the tablist, which
				// is Alpha.
				await press.Tab();
				expect(
					await screen.findByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toHaveFocus();

				// Pressing the right arrow key moves focus to the beta tab, but alpha
				// remains the selected tab because beta is disabled.
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: false,
						name: 'Beta',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Alpha',
					} )
				).toBeVisible();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Alpha',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );

				// Press the right arrow key to select the gamma tab
				await press.ArrowRight();

				expect(
					screen.getByRole( 'tab', {
						selected: true,
						name: 'Gamma',
					} )
				).toHaveFocus();
				expect(
					screen.getByRole( 'tabpanel', {
						name: 'Gamma',
					} )
				).toBeVisible();

				expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );
			} );
		} );

		describe( 'When `selectedId` is changed by the controlling component [Controlled]', () => {
			describe.each( [ true, false ] )(
				'and `selectOnMove` is %s',
				( selectOnMove ) => {
					it( 'should continue to handle arrow key navigation properly', async () => {
						const { rerender } = await render(
							<ControlledTabs
								tabs={ TABS }
								selectedTabId="beta"
								selectOnMove={ selectOnMove }
							/>
						);

						// Beta is the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Beta'
						);

						// Tab key should focus the currently selected tab, which is Beta.
						await press.Tab();
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();

						await rerender(
							<ControlledTabs
								tabs={ TABS }
								selectedTabId="gamma"
								selectOnMove={ selectOnMove }
							/>
						);

						// When the selected tab is changed, focus should not be changed.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Gamma',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tab', {
								selected: false,
								name: 'Beta',
							} )
						).toHaveFocus();

						// Arrow left should move focus to the previous tab (alpha).
						// The alpha tab should be always focused, and should be selected
						// when the `selectOnMove` prop is set to `true`.
						await press.ArrowLeft();
						expect(
							screen.getByRole( 'tab', {
								selected: selectOnMove,
								name: 'Alpha',
							} )
						).toHaveFocus();
					} );

					it( 'should focus the correct tab when tabbing out and back into the tablist', async () => {
						const { rerender } = await render(
							<>
								<button>Focus me</button>
								<ControlledTabs
									tabs={ TABS }
									selectedTabId="beta"
									selectOnMove={ selectOnMove }
								/>
							</>
						);

						// Beta is the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Beta'
						);

						// Tab key should focus the currently selected tab, which is Beta.
						await press.Tab();
						await press.Tab();
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();

						// Change the selected tab to gamma via a controlled update.
						await rerender(
							<>
								<button>Focus me</button>
								<ControlledTabs
									tabs={ TABS }
									selectedTabId="gamma"
									selectOnMove={ selectOnMove }
								/>
							</>
						);

						// When the selected tab is changed, it should not automatically receive focus.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Gamma',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tab', {
								selected: false,
								name: 'Beta',
							} )
						).toHaveFocus();

						// Press shift+tab, move focus to the button before Tabs
						await press.ShiftTab();
						expect(
							screen.getByRole( 'button', { name: 'Focus me' } )
						).toHaveFocus();

						// Press tab, move focus back to the tablist
						await press.Tab();

						const betaTab = screen.getByRole( 'tab', {
							name: 'Beta',
						} );
						const gammaTab = screen.getByRole( 'tab', {
							name: 'Gamma',
						} );

						expect(
							selectOnMove ? gammaTab : betaTab
						).toHaveFocus();
					} );
				}
			);
		} );
	} );

	describe( 'miscellaneous runtime changes', () => {
		describe( 'removing a tab', () => {
			describe( 'with no explicitly set initial tab', () => {
				it( 'should not select a new tab when the selected tab is removed', async () => {
					const mockOnSelect = jest.fn();

					const { rerender } = await render(
						<UncontrolledTabs
							tabs={ TABS }
							onSelect={ mockOnSelect }
						/>
					);

					// Alpha is automatically selected as the selected tab.
					await waitForComponentToBeInitializedWithSelectedTab(
						'Alpha'
					);

					expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
					expect( mockOnSelect ).toHaveBeenLastCalledWith( 'alpha' );

					// Select gamma
					await click( screen.getByRole( 'tab', { name: 'Gamma' } ) );

					expect(
						screen.getByRole( 'tab', {
							selected: true,
							name: 'Gamma',
						} )
					).toHaveFocus();
					expect(
						screen.getByRole( 'tabpanel', {
							name: 'Gamma',
						} )
					).toBeVisible();

					expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
					expect( mockOnSelect ).toHaveBeenLastCalledWith( 'gamma' );

					// Remove gamma
					await rerender(
						<UncontrolledTabs
							tabs={ TABS.slice( 0, 2 ) }
							onSelect={ mockOnSelect }
						/>
					);

					expect( screen.getAllByRole( 'tab' ) ).toHaveLength( 2 );

					// No tab should be selected i.e. it doesn't fall back to gamma,
					// even if it matches the `defaultTabId` prop.
					expect(
						screen.queryByRole( 'tab', { selected: true } )
					).not.toBeInTheDocument();
					// No tabpanel should be rendered either
					expect(
						screen.queryByRole( 'tabpanel' )
					).not.toBeInTheDocument();

					expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
				} );
			} );

			describe.each( [
				[ 'defaultTabId', 'Uncontrolled', UncontrolledTabs ],
				[ 'selectedTabId', 'Controlled', ControlledTabs ],
			] )(
				'when using the `%s` prop [%s]',
				( propName, _mode, Component ) => {
					it( 'should not select a new tab when the selected tab is removed', async () => {
						const mockOnSelect = jest.fn();

						const initialComponentProps = {
							tabs: TABS,
							[ propName ]: 'gamma',
							onSelect: mockOnSelect,
						};

						const { rerender } = await render(
							<Component { ...initialComponentProps } />
						);

						// Gamma is the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Gamma'
						);

						// Remove gamma
						await rerender(
							<Component
								{ ...initialComponentProps }
								tabs={ TABS.slice( 0, 2 ) }
							/>
						);

						expect( screen.getAllByRole( 'tab' ) ).toHaveLength(
							2
						);
						// No tab should be selected i.e. it doesn't fall back to first tab.
						expect(
							screen.queryByRole( 'tab', { selected: true } )
						).not.toBeInTheDocument();
						// No tabpanel should be rendered either
						expect(
							screen.queryByRole( 'tabpanel' )
						).not.toBeInTheDocument();

						// Re-add gamma. Gamma becomes selected again.
						await rerender(
							<Component { ...initialComponentProps } />
						);

						expect( screen.getAllByRole( 'tab' ) ).toHaveLength(
							TABS.length
						);

						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Gamma',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Gamma',
							} )
						).toBeVisible();

						expect( mockOnSelect ).not.toHaveBeenCalled();
					} );

					it( `should not select the tab matching the \`${ propName }\` prop as a fallback when the selected tab is removed`, async () => {
						const mockOnSelect = jest.fn();

						const initialComponentProps = {
							tabs: TABS,
							[ propName ]: 'gamma',
							onSelect: mockOnSelect,
						};

						const { rerender } = await render(
							<Component { ...initialComponentProps } />
						);

						// Gamma is the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Gamma'
						);

						// Select alpha
						await click(
							screen.getByRole( 'tab', { name: 'Alpha' } )
						);

						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Alpha',
							} )
						).toHaveFocus();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Alpha',
							} )
						).toBeVisible();

						expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
						expect( mockOnSelect ).toHaveBeenLastCalledWith(
							'alpha'
						);

						// Remove alpha
						await rerender(
							<Component
								{ ...initialComponentProps }
								tabs={ TABS.slice( 1 ) }
							/>
						);

						expect( screen.getAllByRole( 'tab' ) ).toHaveLength(
							2
						);

						// No tab should be selected i.e. it doesn't fall back to gamma,
						// even if it matches the `defaultTabId` prop.
						expect(
							screen.queryByRole( 'tab', { selected: true } )
						).not.toBeInTheDocument();
						// No tabpanel should be rendered either
						expect(
							screen.queryByRole( 'tabpanel' )
						).not.toBeInTheDocument();

						// Re-add alpha. Alpha becomes selected again.
						await rerender(
							<Component { ...initialComponentProps } />
						);

						expect( screen.getAllByRole( 'tab' ) ).toHaveLength(
							TABS.length
						);

						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Alpha',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Alpha',
							} )
						).toBeVisible();

						expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
					} );
				}
			);
		} );

		describe( 'adding a tab', () => {
			describe.each( [
				[ 'defaultTabId', 'Uncontrolled', UncontrolledTabs ],
				[ 'selectedTabId', 'Controlled', ControlledTabs ],
			] )(
				'when using the `%s` prop [%s]',
				( propName, _mode, Component ) => {
					it( `should select a newly added tab if it matches the \`${ propName }\` prop`, async () => {
						const mockOnSelect = jest.fn();

						const initialComponentProps = {
							tabs: TABS,
							[ propName ]: 'delta',
							onSelect: mockOnSelect,
						};

						const { rerender } = await render(
							<Component { ...initialComponentProps } />
						);

						// No initially selected tabs or tabpanels, since the `defaultTabId`
						// prop is not matching any known tabs.
						await waitForComponentToBeInitializedWithSelectedTab(
							undefined
						);

						expect( mockOnSelect ).not.toHaveBeenCalled();

						// Re-render with beta disabled.
						await rerender(
							<Component
								{ ...initialComponentProps }
								tabs={ TABS_WITH_DELTA }
							/>
						);

						// Delta becomes selected
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Delta',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Delta',
							} )
						).toBeVisible();

						expect( mockOnSelect ).not.toHaveBeenCalled();
					} );
				}
			);
		} );
		describe( 'a tab becomes disabled', () => {
			describe.each( [
				[ 'defaultTabId', 'Uncontrolled', UncontrolledTabs ],
				[ 'selectedTabId', 'Controlled', ControlledTabs ],
			] )(
				'when using the `%s` prop [%s]',
				( propName, _mode, Component ) => {
					it( `should keep the initial tab matching the \`${ propName }\` prop as selected even if it becomes disabled`, async () => {
						const mockOnSelect = jest.fn();

						const initialComponentProps = {
							tabs: TABS,
							[ propName ]: 'beta',
							onSelect: mockOnSelect,
						};

						const { rerender } = await render(
							<Component { ...initialComponentProps } />
						);

						// Beta is the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Beta'
						);

						expect( mockOnSelect ).not.toHaveBeenCalled();

						// Re-render with beta disabled.
						await rerender(
							<Component
								{ ...initialComponentProps }
								tabs={ TABS_WITH_BETA_DISABLED }
							/>
						);

						// Beta continues to be selected and focused, even if it is disabled.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();

						// Re-enable beta.
						await rerender(
							<Component { ...initialComponentProps } />
						);

						// Beta continues to be selected and focused.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();

						expect( mockOnSelect ).not.toHaveBeenCalled();
					} );

					it( 'should keep the current tab selected by the user as selected even if it becomes disabled', async () => {
						const mockOnSelect = jest.fn();

						const { rerender } = await render(
							<Component
								tabs={ TABS }
								onSelect={ mockOnSelect }
							/>
						);

						// Alpha is automatically selected as the selected tab.
						await waitForComponentToBeInitializedWithSelectedTab(
							'Alpha'
						);

						expect( mockOnSelect ).toHaveBeenCalledTimes( 1 );
						expect( mockOnSelect ).toHaveBeenLastCalledWith(
							'alpha'
						);

						// Click on beta tab, beta becomes selected.
						await click(
							screen.getByRole( 'tab', { name: 'Beta' } )
						);

						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();

						expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
						expect( mockOnSelect ).toHaveBeenLastCalledWith(
							'beta'
						);

						// Re-render with beta disabled.
						await rerender(
							<Component
								tabs={ TABS_WITH_BETA_DISABLED }
								onSelect={ mockOnSelect }
							/>
						);

						// Beta continues to be selected, even if it is disabled.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toHaveFocus();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();

						// Re-enable beta.
						await rerender(
							<Component
								tabs={ TABS }
								onSelect={ mockOnSelect }
							/>
						);

						// Beta continues to be selected and focused.
						expect(
							screen.getByRole( 'tab', {
								selected: true,
								name: 'Beta',
							} )
						).toBeVisible();
						expect(
							screen.getByRole( 'tabpanel', {
								name: 'Beta',
							} )
						).toBeVisible();

						expect( mockOnSelect ).toHaveBeenCalledTimes( 2 );
					} );
				}
			);
		} );
	} );
} );
