import { Meta, StoryObj } from '@storybook/react';
import { MarkedLines } from './index';

const meta: Meta< typeof MarkedLines > = {
	title: 'client/dashboard/MarkedLines',
	component: MarkedLines,
	tags: [ 'autodocs' ],
	parameters: {
		docs: {
			description: {
				component: `This component is designed to show contextualized lines from a file with optional highlighting or marks to point out specific parts of one or more lines.

**Additional usage information:**

The numeric keys of the object will be displayed as line numbers and the values of those keys will display as the line at that line number.

The \`marks\` key will hold a similar data structure where the numeric keys are line numbers and the value is a list of pairs of index-ranges which to mark and highlight. The indices are measured in UCS-2 code points, meaning that certain symbols (such as the heart emoji) count as two separate indices.

The indices are based on how Javascript natively indexes strings and can be alternately generated as half the number of bytes necessary for UTF-16 encoding of the string.

Line numbers need not be contiguous which is useful if you want to show two separate parts of a file - perhaps to highlight differences or similarities. This component was originally designed to quickly show where possibly-malicious threats in a file were found.`,
			},
		},
	},
};

export default meta;

type Story = StoryObj< typeof MarkedLines >;

export const Default: Story = {
	args: {
		context: {
			1: 'add :: Num a => a -> a -> a',
			11: 'add = (+)',
			15: 'solve a b = solution',
			16: '	where',
			17: '		solution = sum parts',
			18: '		{- 💩 indices are in UCS-2 code units -}',
			19: '		sum = foldl add 0',
			20: '		parts = foo a b',
			marks: {
				11: [ [ 6, 9 ] ],
				18: [ [ 23, 28 ] ],
				19: [
					[ 2, 5 ],
					[ 14, 17 ],
				],
			},
		},
	},
};

export const NoMarks: Story = {
	args: {
		context: {
			10: 'function simple() {',
			11: '  return true;',
			12: '}',
			marks: {},
		},
	},
};
