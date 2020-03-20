/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import Badge from 'components/badge';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { Button } from '@wordpress/components';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export interface Props extends Button.AnchorProps {
	suggestion: DomainSuggestion;
	isRecommended?: boolean;
	isCurrent?: boolean;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	suggestion,
	isRecommended = false,
	isCurrent = false,
	...props
} ) => {
	const { __: NO__ } = useI18n();

	return (
		<Button className="domain-picker__suggestion-item" isTertiary { ...props }>
			<div className="domain-picker__suggestion-item-name">
				{ suggestion.domain_name }
				{ isRecommended ? (
					<Badge type="info-blue" className="domain-picker__badge">
						{ NO__( 'Recommended' ) }
					</Badge>
				) : null }
				{ isCurrent ? (
					<Badge type="success" className="domain-picker__badge">
						{ NO__( 'Selected' ) }
					</Badge>
				) : null }
			</div>
			<div
				className={ classnames( 'domain-picker__price', {
					'is-paid': ! suggestion.is_free,
				} ) }
			>
				{ /* FIXME: What value do we show here for paid domains? */ }
				{ suggestion.is_free ? NO__( 'Free' ) : NO__( '€4/month' ) }
			</div>
		</Button>
	);
};

export default DomainPickerSuggestionItem;
