import { __experimentalText as Text } from '@wordpress/components';
import { check, Icon } from '@wordpress/icons';

import './style.scss';

interface DomainSuggestionMatchReasonsProps {
	reasons: string[];
}

export const DomainSuggestionMatchReasons = ( { reasons }: DomainSuggestionMatchReasonsProps ) => {
	return (
		<ul className="domain-suggestion-match-reasons">
			{ reasons.map( ( reason ) => {
				return (
					<li key={ reason }>
						<Text variant="muted" className="domain-suggestion-match-reason__text">
							<Icon icon={ check } className="domain-suggestion-match-reason__icon" />
							{ reason }
						</Text>
					</li>
				);
			} ) }
		</ul>
	);
};
