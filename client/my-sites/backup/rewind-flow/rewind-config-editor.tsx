import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ChangeEvent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import type { RewindConfig } from './types';

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
			label: translate( '{{strong}}WordPress themes{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
		},
		{
			name: 'plugins',
			label: translate( '{{strong}}WordPress plugins{{/strong}}', {
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
			label: translate( '{{strong}}Site database{{/strong}} (includes pages, and posts)', {
				components: {
					strong: <strong />,
				},
			} ),
		},
		{
			name: 'uploads',
			label: translate(
				'{{strong}}Media uploads{{/strong}} (you must also select {{em}}Site database{{/em}} for restored media uploads to appear)',
				{
					components: {
						strong: <strong />,
						em: <em />,
					},
					comment:
						'"Site database" is another item of the list, at the same level as "Media Uploads"',
				}
			),
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
						checked={ currentConfig[ name as keyof RewindConfig ] }
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
