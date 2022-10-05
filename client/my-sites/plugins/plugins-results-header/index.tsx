import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { TranslateResult } from 'calypso/../packages/i18n-calypso/types';

import './style.scss';

export default function PluginsResultsHeader( {
	className = '',
	title,
	subtitle,
	browseAllLink,
	resultCount,
}: {
	title: TranslateResult;
	subtitle: TranslateResult;
	browseAllLink?: string;
	resultCount?: string;
	className: string;
} ) {
	const { __ } = useI18n();

	return (
		<div className={ classnames( 'plugins-results-header', className ) }>
			{ ( title || subtitle ) && (
				<div className="plugins-results-header__titles">
					{ title && <div className="plugins-results-header__title">{ title }</div> }
					{ subtitle && <div className="plugins-results-header__subtitle">{ subtitle }</div> }
				</div>
			) }
			{ ( browseAllLink || resultCount ) && (
				<div className="plugins-results-header__actions">
					{ browseAllLink && (
						<a className="plugins-results-header__action" href={ browseAllLink }>
							{ __( 'Browse All' ) }
							<Gridicon icon="arrow-right" size={ 18 } />
						</a>
					) }
					{ resultCount && <span className="plugins-results-header__action">{ resultCount }</span> }
				</div>
			) }
		</div>
	);
}
