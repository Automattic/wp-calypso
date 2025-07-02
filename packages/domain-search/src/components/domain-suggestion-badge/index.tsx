import { __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import type { DomainBadge } from '../DomainSearch/types';
import './style.scss';

export const DomainSuggestionBadge = ( { badge }: { badge: DomainBadge } ) => {
	const { __ } = useI18n();

	const domainBadgeToText = useMemo( () => {
		return {
			recommended: __( 'Recommended' ),
			best_alternative: __( 'Best Alternative' ),
			available: __( 'It’s available!' ),
		};
	}, [ __ ] );

	return (
		<div className="domain-suggestion-badge">
			<Text size="small">{ domainBadgeToText[ badge ] }</Text>
		</div>
	);
};
