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

const BackupRewindConfigEditor: FunctionComponent< Props > = ( {
	currentConfig,
	onConfigChange,
} ) => {
	const translate = useTranslate();

	const onChange = ( { target: { name, checked } }: ChangeEvent< HTMLInputElement > ) =>
		onConfigChange( {
			...currentConfig,
			[ name ]: checked,
		} );

	const checkboxes = [
		{
			name: 'themes',
			label: translate( '{{strong}}WordPress Themes{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
		},
		{
			name: 'plugins',
			label: translate( '{{strong}}WordPress Plugins{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
		},
		{
			name: 'uploads',
			label: translate( '{{strong}}Media Uploads{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
		},
		{
			name: 'roots',
			label: translate(
				'{{strong}}WordPress root{{/strong}} (includes wp-config php and any non WordPress files)',
				{
					components: {
						strong: <strong />,
					},
				}
			),
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
		},
		{
			name: 'sqls',
			label: translate( '{{strong}}Site database{{/strong}} (SQL)', {
				components: {
					strong: <strong />,
				},
			} ),
		},
	];

	return (
		<div className="rewind-flow__rewind-config-editor">
			{ checkboxes.map( ( { name, label } ) => (
				<FormLabel
					className="rewind-flow__rewind-config-editor-label"
					key={ name }
					optional={ false }
					required={ false }
				>
					<FormCheckbox
						checked={ currentConfig[ name ] }
						className="rewind-flow__rewind-config-editor-checkbox"
						name={ name }
						onChange={ onChange }
					/>
					<span className="rewind-flow__rewind-config-editor-label-text">{ label }</span>
				</FormLabel>
			) ) }
		</div>
	);
};

export default BackupRewindConfigEditor;
