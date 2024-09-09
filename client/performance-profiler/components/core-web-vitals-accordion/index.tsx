import { FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import {
	metricsNames,
	mapThresholdsToStatus,
	displayValue,
} from 'calypso/performance-profiler/utils/metrics';
import { StatusIndicator } from '../status-indicator';

import './styles.scss';

type Props = Record< Metrics, number > & {
	activeTab: Metrics | null;
	setActiveTab: ( tab: Metrics | null ) => void;
	children: React.ReactNode;
};
type HeaderProps = {
	displayName: string;
	metricKey: Metrics;
	metricValue: number;
};

const CardHeader = ( props: HeaderProps ) => {
	const { displayName, metricKey, metricValue } = props;
	return (
		<div className="core-web-vitals-accordion__header">
			<StatusIndicator speed={ mapThresholdsToStatus( metricKey, metricValue ) } />
			<div className="core-web-vitals-accordion__header-text">
				<span className="core-web-vitals-accordion__header-text-name">{ displayName }</span>
				<span className="core-web-vitals-accordion__header-text-value">
					{ displayValue( metricKey, metricValue ) }
				</span>
			</div>
		</div>
	);
};

export const CoreWebVitalsAccordion = ( props: Props ) => {
	const { activeTab, setActiveTab, children } = props;
	const translate = useTranslate();

	const onClick = ( key: Metrics ) => {
		// If the user clicks the current tab, close it.
		if ( key === activeTab ) {
			setActiveTab( null );
		} else {
			setActiveTab( key as Metrics );
		}
	};

	return (
		<div className="core-web-vitals-accordion">
			{ Object.entries( metricsNames ).map( ( [ key, { name: displayName } ] ) => {
				if ( props[ key as Metrics ] === undefined || props[ key as Metrics ] === null ) {
					return null;
				}

				// Only display TBT if INP is not available
				if ( key === 'tbt' && props[ 'inp' ] !== undefined && props[ 'inp' ] !== null ) {
					return null;
				}

				return (
					<FoldableCard
						className="core-web-vitals-accordion__card"
						key={ key }
						header={
							<CardHeader
								displayName={ displayName }
								metricKey={ key as Metrics }
								metricValue={ props[ key as Metrics ] }
							/>
						}
						hideSummary
						screenReaderText={ translate( 'More' ) }
						compact
						clickableHeader
						smooth
						iconSize={ 18 }
						onClick={ () => onClick( key as Metrics ) }
						expanded={ key === activeTab }
					>
						{ children }
					</FoldableCard>
				);
			} ) }
		</div>
	);
};
