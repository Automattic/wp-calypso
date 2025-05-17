/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';
import { fn } from '@storybook/test';

/**
 * WordPress dependencies
 */
import { wordpress, more, link } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Tabs } from '..';
import { Slot, Fill, Provider as SlotFillProvider } from '../../slot-fill';
import Button from '../../button';
import Tooltip from '../../tooltip';
import Icon from '../../icon';

const meta: Meta< typeof Tabs > = {
	title: 'Components/Containers/Tabs',
	id: 'components-tabs',
	component: Tabs,
	subcomponents: {
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Tabs.TabList': Tabs.TabList,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Tabs.Tab': Tabs.Tab,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Tabs.TabPanel': Tabs.TabPanel,
		// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
		'Tabs.Context': Tabs.Context,
	},
	tags: [ 'status-private' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
	args: {
		onActiveTabIdChange: fn(),
		onSelect: fn(),
	},
};
export default meta;

const Template: StoryFn< typeof Tabs > = ( props ) => {
	return (
		<Tabs { ...props }>
			<Tabs.TabList>
				<Tabs.Tab tabId="tab1">Tab 1</Tabs.Tab>
				<Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
				<Tabs.Tab tabId="tab3">Tab 3</Tabs.Tab>
			</Tabs.TabList>
			<Tabs.TabPanel tabId="tab1">
				<p>Selected tab: Tab 1</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab2">
				<p>Selected tab: Tab 2</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab3" focusable={ false }>
				<p>Selected tab: Tab 3</p>
				<p>
					This tabpanel has its <code>focusable</code> prop set to
					<code> false</code>, so it won&apos;t get a tab stop.
					<br />
					Instead, the [Tab] key will move focus to the first
					focusable element within the panel.
				</p>
				<Button variant="primary">I&apos;m a button!</Button>
			</Tabs.TabPanel>
		</Tabs>
	);
};

export const Default = Template.bind( {} );

export const SizeAndOverflowPlayground: StoryFn< typeof Tabs > = ( props ) => {
	const [ fullWidth, setFullWidth ] = useState( false );
	return (
		<div>
			<div style={ { maxWidth: '40rem', marginBottom: '1rem' } }>
				<p>
					This story helps understand how the TabList component
					behaves under different conditions. The container below
					(with the dotted red border) can be horizontally resized,
					and it has a bit of padding to be out of the way of the
					TabList.
				</p>
				<p>
					The button will toggle between full width (adding{ ' ' }
					<code>width: 100%</code>) and the default width.
				</p>
				<p>Try the following:</p>
				<ul>
					<li>
						<strong>Small container</strong> that causes tabs to
						overflow with scroll.
					</li>
					<li>
						<strong>Large container</strong> that exceeds the normal
						width of the tabs.
						<ul>
							<li>
								<strong>
									With <code>width: 100%</code>
								</strong>{ ' ' }
								set on the TabList (tabs fill up the space).
							</li>
							<li>
								<strong>
									Without <code>width: 100%</code>
								</strong>{ ' ' }
								(defaults to <code>auto</code>) set on the
								TabList (tabs take up space proportional to
								their content).
							</li>
						</ul>
					</li>
				</ul>
			</div>
			<Button
				style={ { marginBottom: '1rem' } }
				variant="primary"
				onClick={ () => setFullWidth( ! fullWidth ) }
			>
				{ fullWidth
					? 'Remove width: 100% from TabList'
					: 'Set width: 100% in TabList' }
			</Button>
			<Tabs { ...props }>
				<div
					style={ {
						width: '20rem',
						border: '2px dotted red',
						padding: '1rem',
						resize: 'horizontal',
						overflow: 'auto',
					} }
				>
					<Tabs.TabList
						style={ {
							maxWidth: '100%',
							width: fullWidth ? '100%' : undefined,
						} }
					>
						<Tabs.Tab tabId="tab1">
							Label with multiple words
						</Tabs.Tab>
						<Tabs.Tab tabId="tab2">Short</Tabs.Tab>
						<Tabs.Tab tabId="tab3">
							Hippopotomonstrosesquippedaliophobia
						</Tabs.Tab>
						<Tabs.Tab tabId="tab4">Tab 4</Tabs.Tab>
						<Tabs.Tab tabId="tab5">Tab 5</Tabs.Tab>
					</Tabs.TabList>
				</div>
				<Tabs.TabPanel tabId="tab1">
					<p>Selected tab: Tab 1</p>
					<p>(Label with multiple words)</p>
				</Tabs.TabPanel>
				<Tabs.TabPanel tabId="tab2">
					<p>Selected tab: Tab 2</p>
					<p>(Short)</p>
				</Tabs.TabPanel>
				<Tabs.TabPanel tabId="tab3">
					<p>Selected tab: Tab 3</p>
					<p>(Hippopotomonstrosesquippedaliophobia)</p>
				</Tabs.TabPanel>
				<Tabs.TabPanel tabId="tab4">
					<p>Selected tab: Tab 4</p>
				</Tabs.TabPanel>
				<Tabs.TabPanel tabId="tab5">
					<p>Selected tab: Tab 5</p>
				</Tabs.TabPanel>
			</Tabs>
		</div>
	);
};
SizeAndOverflowPlayground.args = {
	defaultTabId: 'tab4',
};

const VerticalTemplate: StoryFn< typeof Tabs > = ( props ) => {
	return (
		<Tabs orientation="vertical" { ...props }>
			<Tabs.TabList style={ { maxWidth: '10rem' } }>
				<Tabs.Tab tabId="tab1">Tab 1</Tabs.Tab>
				<Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
				<Tabs.Tab tabId="tab3">Tab 3</Tabs.Tab>
			</Tabs.TabList>
		</Tabs>
	);
};

export const Vertical = VerticalTemplate.bind( {} );

const DisabledTabTemplate: StoryFn< typeof Tabs > = ( props ) => {
	return (
		<Tabs { ...props }>
			<Tabs.TabList>
				<Tabs.Tab tabId="tab1" disabled>
					Tab 1
				</Tabs.Tab>
				<Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
				<Tabs.Tab tabId="tab3">Tab 3</Tabs.Tab>
			</Tabs.TabList>
			<Tabs.TabPanel tabId="tab1">
				<p>Selected tab: Tab 1</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab2">
				<p>Selected tab: Tab 2</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab3">
				<p>Selected tab: Tab 3</p>
			</Tabs.TabPanel>
		</Tabs>
	);
};
export const DisabledTab = DisabledTabTemplate.bind( {} );

const WithTabIconsAndTooltipsTemplate: StoryFn< typeof Tabs > = ( props ) => {
	return (
		<Tabs { ...props }>
			<Tabs.TabList>
				{ [
					{
						id: 'tab1',
						label: 'Tab one',
						icon: wordpress,
					},
					{
						id: 'tab2',
						label: 'Tab two',
						icon: link,
					},
					{
						id: 'tab3',
						label: 'Tab three',
						icon: more,
					},
				].map( ( { id, label, icon } ) => (
					<Tooltip text={ label } key={ id }>
						<Tabs.Tab tabId={ id } aria-label={ label }>
							<Icon icon={ icon } />
						</Tabs.Tab>
					</Tooltip>
				) ) }
			</Tabs.TabList>
			<Tabs.TabPanel tabId="tab1">
				<p>Selected tab: Tab 1</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab2">
				<p>Selected tab: Tab 2</p>
			</Tabs.TabPanel>
			<Tabs.TabPanel tabId="tab3">
				<p>Selected tab: Tab 3</p>
			</Tabs.TabPanel>
		</Tabs>
	);
};
export const WithTabIconsAndTooltips = WithTabIconsAndTooltipsTemplate.bind(
	{}
);

export const ManualActivation = Template.bind( {} );
ManualActivation.args = {
	selectOnMove: false,
};

const UsingSlotFillTemplate: StoryFn< typeof Tabs > = ( props ) => {
	return (
		<SlotFillProvider>
			<Tabs { ...props }>
				<Tabs.TabList>
					<Tabs.Tab tabId="tab1">Tab 1</Tabs.Tab>
					<Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
					<Tabs.Tab tabId="tab3">Tab 3</Tabs.Tab>
				</Tabs.TabList>
				<Fill name="tabs-are-fun">
					<Tabs.TabPanel tabId="tab1">
						<p>Selected tab: Tab 1</p>
					</Tabs.TabPanel>
					<Tabs.TabPanel tabId="tab2">
						<p>Selected tab: Tab 2</p>
					</Tabs.TabPanel>
					<Tabs.TabPanel tabId="tab3">
						<p>Selected tab: Tab 3</p>
					</Tabs.TabPanel>
				</Fill>
			</Tabs>
			<div
				style={ {
					border: '2px solid #999',
					width: '300px',
					margin: '20px auto',
				} }
			>
				<p>other stuff</p>
				<p>other stuff</p>
				<p>this is fun!</p>
				<p>other stuff</p>
				<Slot bubblesVirtually as="div" name="tabs-are-fun" />
			</div>
		</SlotFillProvider>
	);
};
export const UsingSlotFill = UsingSlotFillTemplate.bind( {} );
UsingSlotFill.storyName = 'Using SlotFill';

const CloseButtonTemplate: StoryFn< typeof Tabs > = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( true );

	return (
		<>
			{ isOpen ? (
				<div
					style={ {
						width: '400px',
						height: '100vh',
						borderRight: '1px solid #333',
					} }
				>
					<Tabs { ...props }>
						<div
							style={ {
								display: 'flex',
								borderBottom: '1px solid #333',
							} }
						>
							<Tabs.TabList>
								<Tabs.Tab tabId="tab1">Tab 1</Tabs.Tab>
								<Tabs.Tab tabId="tab2">Tab 2</Tabs.Tab>
								<Tabs.Tab tabId="tab3">Tab 3</Tabs.Tab>
							</Tabs.TabList>
							<Button
								variant="tertiary"
								style={ {
									marginLeft: 'auto',
									alignSelf: 'center',
								} }
								onClick={ () => setIsOpen( false ) }
							>
								Close Tabs
							</Button>
						</div>
						<Tabs.TabPanel tabId="tab1">
							<p>Selected tab: Tab 1</p>
						</Tabs.TabPanel>
						<Tabs.TabPanel tabId="tab2">
							<p>Selected tab: Tab 2</p>
						</Tabs.TabPanel>
						<Tabs.TabPanel tabId="tab3">
							<p>Selected tab: Tab 3</p>
						</Tabs.TabPanel>
					</Tabs>
				</div>
			) : (
				<Button variant="tertiary" onClick={ () => setIsOpen( true ) }>
					Open Tabs
				</Button>
			) }
		</>
	);
};
export const InsertCustomElements = CloseButtonTemplate.bind( {} );
