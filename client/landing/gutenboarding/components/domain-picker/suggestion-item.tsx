/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

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
	onClick,
} ) => {
	const { __: NO__ } = useI18n();

	return (
		<label className="domain-picker__suggestion-item">
			<div className="domain-picker__suggestion-item-name">
				<input
					className="domain-picker__suggestion-radio-button"
					type="radio"
					name="domain-picker-suggestion-option"
					onClick={ onClick }
					checked={ isCurrent }
				/>
				{ suggestion.domain_name }
				{ isRecommended && (
					<div className="domain-picker__badge is-recommended">{ NO__( 'Recommended' ) }</div>
				) }
			</div>
			<div
				className={ classnames( 'domain-picker__price', {
					'is-paid': ! suggestion.is_free,
				} ) }
			>
				{ suggestion.is_free ? (
					NO__( 'Free' )
				) : (
					<>
						{ ' ' }
						<span className="domain-picker__free-text"> { NO__( 'Free' ) } </span>
						<span className="domain-picker__price-is-paid">
							{ ' ' }
							{ sprintf( NO__( '%s/year' ), suggestion.cost ) }{ ' ' }
						</span>
					</>
				) }
			</div>
		</label>
	);
};

export default DomainPickerSuggestionItem;
