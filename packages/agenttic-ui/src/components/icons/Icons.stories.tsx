import type { Meta, StoryObj } from '@storybook/react';
import { ArrowUpIcon } from './ArrowUpIcon';
import { BigSkyIcon } from './BigSkyIcon';
import { StopIcon } from './StopIcon';
import { StylesIcon } from './StylesIcon';
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
			control: { type: 'range', min: 16, max: 64, step: 4 },
			defaultValue: 24,
		},
		className: {
			control: 'text',
		},
	},
} satisfies Meta< typeof IconShowcase >;

export default meta;
type Story = StoryObj< typeof meta >;

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

export const X: Story = {
	render: ( args ) => (
		<XIcon size={ args.size } className={ args.className } />
	),
	args: {
		size: 24,
	},
};

// Gallery showing all icons
export const Gallery: Story = {
	render: ( args ) => (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gap: '1.5rem',
			} }
		>
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '0.5rem',
				} }
			>
				<ArrowUpIcon size={ args.size } className={ args.className } />
				<span style={ { fontSize: '0.875rem', color: '#4B5563' } }>
					ArrowUp
				</span>
			</div>
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '0.5rem',
				} }
			>
				<BigSkyIcon size={ args.size } className={ args.className } />
				<span style={ { fontSize: '0.875rem', color: '#4B5563' } }>
					BigSky
				</span>
			</div>
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '0.5rem',
				} }
			>
				<StopIcon size={ args.size } className={ args.className } />
				<span style={ { fontSize: '0.875rem', color: '#4B5563' } }>
					Stop
				</span>
			</div>
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '0.5rem',
				} }
			>
				<StylesIcon size={ args.size } className={ args.className } />
				<span style={ { fontSize: '0.875rem', color: '#4B5563' } }>
					Styles
				</span>
			</div>
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '0.5rem',
				} }
			>
				<XIcon size={ args.size } className={ args.className } />
				<span style={ { fontSize: '0.875rem', color: '#4B5563' } }>
					X
				</span>
			</div>
		</div>
	),
	args: {
		size: 32,
	},
};

// Different sizes example
export const Sizes: Story = {
	render: () => (
		<div
			style={ {
				display: 'flex',
				alignItems: 'center',
				gap: '1rem',
			} }
		>
			<ArrowUpIcon size={ 16 } />
			<ArrowUpIcon size={ 24 } />
			<ArrowUpIcon size={ 32 } />
			<ArrowUpIcon size={ 48 } />
			<ArrowUpIcon size={ 64 } />
		</div>
	),
};
