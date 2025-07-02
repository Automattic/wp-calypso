import {
	__experimentalHStack as HStack,
	Icon,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { DomainMatchReason } from '../DomainSearch/types';

import './style.scss';

export const DomainSuggestionMatchReasons = ( {
	tld,
	matchReasons,
}: {
	tld: string;
	matchReasons: DomainMatchReason[];
} ) => {
	const { __ } = useI18n();

	const matchReasonToText = useMemo( () => {
		return {
			exact_match: __( 'Exact match' ),
			most_common_extension: sprintf(
				/* translators: tld is the top level domain (ex. com, net, org) */
				__( '".%(tld)s" is the most common extension' ),
				{
					tld,
				}
			),
		};
	}, [ __, tld ] );

	return (
		<ul className="domain-suggestion-match-reasons">
			{ matchReasons.map( ( reason ) => (
				<li key={ reason } className="domain-suggestion-match-reasons__reason">
					<HStack spacing={ 2 } alignment="left">
						<div style={ { display: 'contents', fill: 'var( --wp-admin-theme-color )' } }>
							<Icon icon={ check } />
						</div>
						<Text size="body" variant="muted">
							{ matchReasonToText[ reason ] }
						</Text>
					</HStack>
				</li>
			) ) }
		</ul>
	);
};
