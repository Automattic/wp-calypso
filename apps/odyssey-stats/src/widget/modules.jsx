import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import useModuleDataQuery from '../hooks/use-module-data-query';

import './modules.scss';

function ModuleCard( { icon, title, value, className = null } ) {
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			<div className="stats-widget-module__value">
				<ShortenedNumber value={ value } />
			</div>
		</div>
	);
}

export default function Modules() {
	const translate = useTranslate();

	// TODO: add a loading state placeholder with isFetching returned from the query.
	const { data: akismetData } = useModuleDataQuery( 'akismet' );
	const { data: protectData } = useModuleDataQuery( 'protect' );

	return (
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				value={ protectData }
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ akismetData }
			/>
		</div>
	);
}
