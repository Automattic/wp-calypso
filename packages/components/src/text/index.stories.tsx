/**
 * External dependencies
 */
import * as React from 'react';

import { Text } from '.';

export default {
	title: 'Text',
	component: Text,
};

export const _default = () => (
	<React.Fragment>
		<Text variant="title.large" as="h1">
			Title Large
		</Text>
		<Text variant="title.medium" as="h2">
			Title Medium
		</Text>
		<Text variant="title.small" as="h3">
			Title Small
		</Text>
		<Text variant="subtitle">Subtitle</Text>
		<Text variant="subtitle.small">Subtitle Small</Text>
		<Text variant="body">Body</Text>
		<Text variant="body.small">Body Small</Text>
		<Text variant="button">Button</Text>
		<Text variant="caption">Caption</Text>
		<Text variant="label">Label</Text>
	</React.Fragment>
);

export const TitleLarge = () => (
	<Text variant="title.large" as="h1">
		Title Large
	</Text>
);
export const TitleMedium = () => (
	<Text variant="title.medium" as="h2">
		Title Medium
	</Text>
);
export const TitleSmall = () => (
	<Text variant="title.small" as="h3">
		Title Small
	</Text>
);

export const Subtitle = () => <Text variant="subtitle">Subtitle</Text>;
export const SubtitleSmall = () => <Text variant="subtitle.small">Subtitle Small</Text>;

export const Body = () => <Text variant="body">Body</Text>;
export const BodySmall = () => <Text variant="body.small">Body Small</Text>;

export const Button = () => <Text variant="button">Button</Text>;
export const Caption = () => <Text variant="caption">Caption</Text>;
export const Label = () => <Text variant="label">Label</Text>;
