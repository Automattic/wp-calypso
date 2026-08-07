import type { Meta, StoryObj } from '@storybook/react';
import { AltIcon } from './AltIcon';
import { ArrowUpIcon } from './ArrowUpIcon';
import { BigSkyIcon } from './BigSkyIcon';
import { BlurIcon } from './BlurIcon';
import { CheckIcon } from './CheckIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { ChevronRightIcon } from './ChevronRightIcon';
import { ChevronUpIcon } from './ChevronUpIcon';
import { CopyIcon } from './CopyIcon';
import { ImageIcon } from './ImageIcon';
import { LayoutIcon } from './LayoutIcon';
import { PageIcon } from './PageIcon';
import { PlusIcon } from './PlusIcon';
import { RegenerateIcon } from './RegenerateIcon';
import { StopIcon } from './StopIcon';
import { StylesIcon } from './StylesIcon';
import { ThumbsDownIcon } from './ThumbsDownIcon';
import { ThumbsUpIcon } from './ThumbsUpIcon';
import { XIcon } from './XIcon';

interface IconStoryArgs {
	size?: number;
	className?: string;
}

const IconShowcase = ( { size, className }: IconStoryArgs ) => {
	return <ArrowUpIcon size={ size } className={ className } />;
};

const meta = {
	title: 'Icons/All Icons',
	component: IconShowcase,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		size: {
			control: { type: 'range', min: 24, max: 64, step: 4 },
			defaultValue: 24,
		},
		className: {
			control: 'text',
		},
	},
} satisfies Meta< typeof IconShowcase >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Alt: Story = {
	render: ( args ) => (
		<AltIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ArrowUp: Story = {
	render: ( args ) => (
		<ArrowUpIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const BigSky: Story = {
	render: ( args ) => (
		<BigSkyIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Blur: Story = {
	render: ( args ) => (
		<BlurIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Check: Story = {
	render: ( args ) => (
		<CheckIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ChevronDown: Story = {
	render: ( args ) => (
		<ChevronDownIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ChevronRight: Story = {
	render: ( args ) => (
		<ChevronRightIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ChevronUp: Story = {
	render: ( args ) => (
		<ChevronUpIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Copy: Story = {
	render: ( args ) => (
		<CopyIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Image: Story = {
	render: ( args ) => (
		<ImageIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Layout: Story = {
	render: ( args ) => (
		<LayoutIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Page: Story = {
	render: ( args ) => (
		<PageIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Plus: Story = {
	render: ( args ) => (
		<PlusIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Regenerate: Story = {
	render: ( args ) => (
		<RegenerateIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Stop: Story = {
	render: ( args ) => (
		<StopIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const Styles: Story = {
	render: ( args ) => (
		<StylesIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ThumbsDown: Story = {
	render: ( args ) => (
		<ThumbsDownIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const ThumbsUp: Story = {
	render: ( args ) => (
		<ThumbsUpIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

export const X: Story = {
	render: ( args ) => (
		<XIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};
