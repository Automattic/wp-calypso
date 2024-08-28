import { FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import { metricsNames } from 'calypso/performance-profiler/utils/metrics';

type Props = Record< Metrics, number > & {
	activeTab: Metrics;
	setActiveTab: ( tab: Metrics ) => void;
	children: React.ReactNode;
};

export const CoreWebVitalsAccordion = ( props: Props ) => {
	const { activeTab, setActiveTab, children } = props;
	const translate = useTranslate();

	const onClick = ( key: Metrics ) => {
		setActiveTab( key as Metrics );
	};

	return (
		<div>
			{ Object.entries( metricsNames ).map( ( [ key, { displayName } ] ) => {
				return (
					<FoldableCard
						className="metric-tab-bar__mobile-tab"
						key={ key }
						// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
						header={ <div onClick={ () => onClick( key as Metrics ) }>{ displayName }</div> }
						screenReaderText={ translate( 'More' ) }
						compact
						clickableHeader
						smooth
						iconSize={ 18 }
						onClick={ () => onClick( key as Metrics ) }
						expanded={ key === activeTab }
					>
						<div>{ children }</div>
					</FoldableCard>
				);
			} ) }
		</div>
	);
};
