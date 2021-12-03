import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';

const PluginDetailsSidebar = ( props ) => {
	const { plugin } = props;
    
    const translate = useTranslate();

	return (
		<>
			<div className="plugin-details-sidebar__plugin-details-title">{ translate( 'Plugin details' ) }</div>
			<div className="plugin-details-sidebar__plugin-details-content">
				<div className="plugin-details-sidebar__active-installs">
					<div className="plugin-details-sidebar__active-installs-text title">
						{ translate( 'Active installations' ) }
					</div>
					<div className="plugin-details-sidebar__active-installs-value value">
						{ formatNumberMetric( plugin.active_installs, 'en' ) }
					</div>
				</div>
				<div className="plugin-details-sidebar__tested">
					<div className="plugin-details-sidebar__tested-text title">{ translate( 'Tested up to' ) }</div>
					<div className="plugin-details-sidebar__tested-value value">{ plugin.tested }</div>
				</div>
			</div>
		</>
	);
};

export default PluginDetailsSidebar;
