import { SimplifiedSegmentedControl } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JETPACK_SUPPORT_URL } from '../const';
import useModuleDevicesQuery from '../hooks/use-modeule-devices-query';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

// import '../stats-module/style.scss';
// import '../stats-list/style.scss';
import './stats-module-devices.scss';

const OPTION_KEYS = {
	SIZE: 'size',
	BROWSER: 'browser',
	OS: 'os',
};

type SelectOptionType = {
	label: string;
	value: string;
};

interface StatsModuleDevicesProps {
	path: string;
	className?: string;
	period?: string;
	postId?: number;
	query: object;
	summary?: boolean;
	isLoading?: boolean;
}

const StatsModuleDevices: React.FC< StatsModuleDevicesProps > = ( {
	path,
	className,
	// period, // we will need period once the API endpoint is done
	isLoading,
	query,
	postId,
} ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const translate = useTranslate();

	const optionLabels = {
		[ OPTION_KEYS.SIZE ]: {
			selectLabel: translate( 'Size' ),
			headerLabel: translate( 'Visitors share per screen size' ),
		},
		[ OPTION_KEYS.BROWSER ]: {
			selectLabel: translate( 'Browser' ),
			headerLabel: translate( 'Browser' ),
		},
		[ OPTION_KEYS.OS ]: {
			selectLabel: translate( 'OS' ),
			headerLabel: translate( 'Operating System' ),
		},
	};

	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.BROWSER );

	const { isFetching: isFetchingUTM, metrics: data } = useModuleDevicesQuery(
		siteId,
		selectedOption,
		query,
		postId
	);

	const showLoader = isLoading || isFetchingUTM;

	const changeViewButton = ( selection: SelectOptionType ) => {
		const filter = selection.value;

		// TODO: add analytics events

		setSelectedOption( filter );
	};

	return (
		// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
		<StatsListCard
			className={ classNames( className, 'stats-module__card', path ) }
			moduleType={ path }
			data={ data }
			title={ translate( 'Devices', { context: 'Stats: title of module', textOnly: true } ) }
			emptyMessage={ translate(
				'If you use UTM codes, your {{link}}campaign performance data{{/link}} will show here.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <a href={ localizeUrl( `${ JETPACK_SUPPORT_URL }#devices-stats` ) } />,
					},
					context: 'Stats: Info box label when the UTM module is empty',
				}
			) }
			metricLabel={ translate( 'Visitors' ) }
			loader={ showLoader && <StatsModulePlaceholder isLoading={ showLoader } /> }
			splitHeader
			useShortNumber
			mainItemLabel={ optionLabels[ selectedOption ]?.headerLabel }
			toggleControl={
				<SimplifiedSegmentedControl
					options={ Object.entries( optionLabels ).map( ( entry ) => ( {
						value: entry[ 0 ], // optionLabels key
						label: entry[ 1 ].selectLabel, // optionLabels object value
					} ) ) }
					initialSelected={ OPTION_KEYS.BROWSER } // until pie chart is added
					// @ts-expect-error TODO: missing TS type
					onSelect={ changeViewButton }
				/>
			}
		/>
	);
};

export { StatsModuleDevices as default, StatsModuleDevices, OPTION_KEYS };
