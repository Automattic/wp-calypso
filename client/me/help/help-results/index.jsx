import { CompactCard } from '@automattic/components';
import HelpResult from './item';

import './style.scss';

export default function HelpResults( {
	compact,
	footer,
	helpLinks,
	header,
	iconTypeDescription,
	onClick,
	searchLink,
} ) {
	if ( ! helpLinks.length ) {
		return null;
	}

	return (
		<>
			{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
			<h2 className="help__section-title">{ header }</h2>
			<div className="help-results">
				{ helpLinks.map( ( helpLink ) => (
					<HelpResult
						key={ helpLink.link }
						helpLink={ helpLink }
						iconTypeDescription={ iconTypeDescription }
						onClick={ onClick }
						compact={ compact }
					/>
				) ) }
				{ footer && (
					<a href={ searchLink } target="_blank" rel="noreferrer noopener">
						<CompactCard className="help-results__footer">
							<span className="help-results__footer-text">{ footer }</span>
						</CompactCard>
					</a>
				) }
			</div>
		</>
	);
}
