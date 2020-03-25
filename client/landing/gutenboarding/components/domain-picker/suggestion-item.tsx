/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { Button } from '@wordpress/components';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props extends Button.AnchorProps {
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
				{ isRecommended && (
					<div className="domain-picker__badge is-recommended">{ NO__( 'Recommended' ) }</div>
				) }
				{ isCurrent && (
					<div className="domain-picker__badge is-selected">{ NO__( 'Selected' ) }</div>
				) }
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
