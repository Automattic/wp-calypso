/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'break-on-translate';

const save = () => <div>{ __( 'Email' ) }</div>;

export const settings = {
	title: 'Break on site language change or translation change',
	category: 'jetpack',
	edit: save,
	save,
};
