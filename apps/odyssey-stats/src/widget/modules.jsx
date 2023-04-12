import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

import './modules.scss';

function ModuleCard( { icon, title, value, className = null } ) {
	// TODO: add a placeholder state

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

	return (
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				value={ 75911 }
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ 8322 }
			/>
		</div>
	);
}
