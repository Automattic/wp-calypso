import { Meta } from '@storybook/react';
import React from 'react';
import { PrimaryDomainLabel } from './index';
import './stories.scss';

export default {
	title: 'packages/domains-table/PrimaryDomainLabel',
	component: PrimaryDomainLabel,
	parameters: {
		viewport: {
			defaultViewport: 'LARGE',
		},
	},
} as Meta;

const Template = () => (
	<div className="domains-table-stories__primary-domain-label-container">
		<PrimaryDomainLabel />
	</div>
);

export const Default = Template.bind( {} );
