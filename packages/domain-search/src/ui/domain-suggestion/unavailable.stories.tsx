import { DomainSuggestion } from '.';
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
			<DomainSuggestion.Unavailable
				domain="example-unavailable"
				tld="com"
				reason="already-registered"
				onTransferClick={ () => alert( 'Your wish is an order!' ) }
			/>
		</div>
	);
};

Default.parameters = {
	viewport: {
		defaultViewport: 'desktop',
	},
};

const meta: Meta< typeof Default > = {
	title: 'DomainSuggestion/Unavailable',
	component: Default,
};

export default meta;

export const Mobile = () => {
	return <Default />;
};

Mobile.parameters = {
	viewport: {
		defaultViewport: 'mobile1',
	},
};
