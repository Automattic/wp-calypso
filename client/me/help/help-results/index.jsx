import { CompactCard } from '@automattic/components';
import HelpResult from '../help-results-v2/help-results';

import './style.scss';

export default function HelpResults( {
	compact,
	footer,
	helpLinks,
	header,
	iconTypeDescription,
	onClick,
	searchLink,
	openInHelpCenter,
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
						openInHelpCenter={ openInHelpCenter }
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
