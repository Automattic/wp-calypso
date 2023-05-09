import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const ThreatListHeader = () => {
	const translate = useTranslate();

	return (
		<CompactCard className="threat-list-header threat-list-header__wrapper">
			<div className="threat-list-header__title title__severity">{ translate( 'Severity' ) }</div>
			<div className="threat-list-header__title title__details">{ translate( 'Details' ) }</div>
			<div className="threat-list-header__title title__autofix">{ translate( 'Auto Fix' ) }</div>
		</CompactCard>
	);
};

export default ThreatListHeader;
