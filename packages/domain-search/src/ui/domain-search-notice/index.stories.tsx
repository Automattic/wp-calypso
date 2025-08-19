import { DomainSearchNotice } from '.';
import type { Meta } from '@storybook/react';

export const Default = () => {
	return (
		<div
			style={ {
				margin: '0 auto',
				padding: '1rem',
				boxSizing: 'border-box',
				width: '100%',
				maxWidth: '1040px',
			} }
		>
			<DomainSearchNotice status="error">
				Something went wrong. <a href="https://youtube.com">Click here to watch a video.</a>
			</DomainSearchNotice>
		</div>
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainSearchNotice',
	component: Default,
};

export default meta;
