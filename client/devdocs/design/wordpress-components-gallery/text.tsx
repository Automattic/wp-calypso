/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalText as Text } from '@wordpress/components';

const TextExample = () => (
	<>
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
	</>
);

export default TextExample;
