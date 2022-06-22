import { useTranslate } from 'i18n-calypso';

export default function PluginDetailsCTAPreinstalled( { pluginName } ) {
	const translate = useTranslate();
	return (
		<>
			<div className="plugin-details-CTA__price">{ translate( 'Free' ) }</div>
			<span className="plugin-details-CTA__preinstalled">
				{ translate( '%s is automatically managed for you.', { args: pluginName } ) }
			</span>
		</>
	);
}
