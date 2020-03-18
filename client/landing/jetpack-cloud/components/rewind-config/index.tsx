/**
 * External dependencies
 */
import React, { FunctionComponent, ChangeEvent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import { RewindConfig } from './types';
/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	currentConfig: RewindConfig;
	onConfigChange: ( config: RewindConfig ) => void;
}

const JetpackCloudRewindConfig: FunctionComponent< Props > = ( {
	currentConfig,
	onConfigChange,
} ) => {
	const translate = useTranslate();

	const checkboxes = [
		{
			name: 'themes',
			label: translate( '{{strong}}WordPress Themes{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
			checked: ( { themes }: RewindConfig ) => themes,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					themes: checked,
				} ),
		},
		{
			name: 'plugins',
			label: translate( '{{strong}}WordPress Plugins{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
			checked: ( { plugins }: RewindConfig ) => plugins,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					plugins: checked,
				} ),
		},
		{
			name: 'uploads',
			label: translate( '{{strong}}Media Uploads{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
			checked: ( { uploads }: RewindConfig ) => uploads,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					uploads: checked,
				} ),
		},
		{
			name: 'roots',
			label: translate(
				'{{strong}}WordPress root{{/strong}} (includes wp-config.php and any non-WordPress files)',
				{
					components: {
						strong: <strong />,
					},
				}
			),
			checked: ( { roots }: RewindConfig ) => roots,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					roots: checked,
				} ),
		},
		{
			name: 'contents',
			label: translate(
				'{{strong}}WP-content directory{{/strong}} (excludes themes, plugins, and uploads)',
				{
					components: {
						strong: <strong />,
					},
				}
			),
			checked: ( { contents }: RewindConfig ) => contents,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					contents: checked,
				} ),
		},
		{
			name: 'sqls',
			label: translate( '{{strong}}Site database{{/strong}} (SQL)', {
				components: {
					strong: <strong />,
				},
			} ),
			checked: ( { sqls }: RewindConfig ) => sqls,
			onChange: ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
				onConfigChange( {
					...currentConfig,
					sqls: checked,
				} ),
		},
	];

	return (
		<div className="rewind-config">
			{ checkboxes.map( ( { name, label, checked, onChange } ) => (
				<FormLabel className="rewind-config__label" required={ false } optional={ false }>
					<FormCheckbox
						checked={ checked( currentConfig ) }
						className="rewind-config__checkbox"
						name={ name }
						onChange={ onChange }
					/>
					{ label }
				</FormLabel>
			) ) }
		</div>
	);
};

export default JetpackCloudRewindConfig;
