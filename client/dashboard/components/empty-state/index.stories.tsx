import { Meta, StoryObj } from '@storybook/react';
import { __experimentalText as Text, Button, Icon } from '@wordpress/components';
import { cog, layout, page, settings } from '@wordpress/icons';
import upsellIllustration from '../../sites/hosting-feature-gated-with-callout/upsell-illustration.svg';
import { Callout } from '../callout';
import EmptyState from './index';

const meta: Meta< typeof EmptyState > = {
	title: 'client/dashboard/EmptyState',
	component: EmptyState,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof EmptyState >;

export const Default: Story = {
	args: {
		children: (
			<>
				<EmptyState.Header>
					<EmptyState.Title>No items yet</EmptyState.Title>
					<EmptyState.Description>Get started by creating your first item.</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title="Create item"
							description="Set up a new item to see it appear here."
							actions={
								<Button __next40pxDefaultSize variant="primary">
									Create item
								</Button>
							}
						/>
					</EmptyState.ActionList>
				</EmptyState.Content>
			</>
		),
	},
};

export const WithMultipleActions: Story = {
	args: {
		children: (
			<>
				<EmptyState.Header>
					<EmptyState.Title>Nothing here yet</EmptyState.Title>
					<EmptyState.Description>
						Choose one of the options below to get started.
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title="Create item"
							description="Set up a new item to see it appear here."
							actions={
								<Button __next40pxDefaultSize variant="primary">
									Create item
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title="Learn more"
							description="Read the documentation to understand how this works."
							actions={
								<Button variant="secondary" size="compact">
									View docs
								</Button>
							}
						/>
					</EmptyState.ActionList>
				</EmptyState.Content>
			</>
		),
	},
};

export const WithContentBelowActions: Story = {
	args: {
		children: (
			<>
				<EmptyState.Header>
					<EmptyState.Title>No items yet</EmptyState.Title>
					<EmptyState.Description>Get started by creating your first item.</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title="Create item"
							description="Set up a new item to see it appear here."
							actions={
								<Button __next40pxDefaultSize variant="primary">
									Create item
								</Button>
							}
						/>
					</EmptyState.ActionList>
					<p style={ { textAlign: 'center', margin: 0 } }>
						You can always change this later in your settings.
					</p>
				</EmptyState.Content>
			</>
		),
	},
};

export const WithIconsAndActions: Story = {
	args: {
		children: (
			<>
				<EmptyState.Header>
					<EmptyState.Title>Set up your site</EmptyState.Title>
					<EmptyState.Description>
						Choose an option below to start customizing your site.
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title="Pick a design"
							description="Browse themes and layouts that fit your brand."
							decoration={ <Icon icon={ layout } /> }
							actions={
								<Button variant="secondary" size="compact">
									Browse designs
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title="Create a page"
							description="Start with a new page and add your content."
							decoration={ <Icon icon={ page } /> }
							actions={
								<Button variant="secondary" size="compact">
									New page
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title="Settings"
							description="Adjust advanced options as your site grows."
							decoration={ <Icon icon={ cog } /> }
							actions={
								<Button variant="secondary" size="compact">
									Open settings
								</Button>
							}
						/>
					</EmptyState.ActionList>
				</EmptyState.Content>
			</>
		),
	},
};

/**
 * Without `EmptyState.Content`, the ActionList collapses to its intrinsic width.
 * Use `EmptyState.Content` to constrain the width to `min(100%, 660px)`.
 */
export const WithoutContentWrapper: Story = {
	args: {
		children: (
			<>
				<EmptyState.Header>
					<EmptyState.Title>No items yet</EmptyState.Title>
					<EmptyState.Description>
						Notice how the ActionList below collapses without Content wrapper.
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.ActionList>
					<EmptyState.ActionItem
						title="Create item"
						description="Set up a new item to see it appear here."
						actions={
							<Button __next40pxDefaultSize variant="primary">
								Create item
							</Button>
						}
					/>
				</EmptyState.ActionList>
			</>
		),
	},
};

export const WithContainerAndCallout: Story = {
	render: ( args ) => (
		<EmptyState.Wrapper>
			<EmptyState { ...args } />
		</EmptyState.Wrapper>
	),
	args: {
		children: (
			<EmptyState.Content>
				<Callout
					icon={ settings }
					image={ upsellIllustration }
					title="Fine-tune your WordPress site"
					description={
						<>
							<Text variant="muted">
								Get under the hood—control caching, choose your PHP version, control security, and
								test out upcoming WordPress releases.
							</Text>
							<Text variant="muted">
								Available on the WordPress.com Business and Commerce plans.
							</Text>
						</>
					}
					actions={
						<Button __next40pxDefaultSize variant="primary">
							Upgrade plan
						</Button>
					}
				/>
			</EmptyState.Content>
		),
	},
};
