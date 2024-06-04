import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { Icon, chevronDown } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import * as React from 'react';
import { DOMAIN_SUGGESTIONS_STORE } from '../../constants';
import type { DomainSuggestionsSelect } from '@automattic/data-stores';

import './style.scss';

export interface Props {
	onSelect: ( domainCategorySlug?: string ) => void;
	selected?: string;
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	const { __ } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

	const handleSelect = ( slug?: string ) => {
		setIsOpen( false );
		onSelect( slug );
	};

	const domainCategories = useSelect(
		( select ) => ( select( DOMAIN_SUGGESTIONS_STORE ) as DomainSuggestionsSelect ).getCategories(),
		[]
	);

	const allCategoriesLabel = __( 'All Categories', __i18n_text_domain__ );

	return (
		<div className={ clsx( 'domain-categories', { 'is-open': isOpen } ) }>
			<Button
				className="domain-categories__dropdown-button"
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<span>{ selected ?? allCategoriesLabel }</span>
				<Icon icon={ chevronDown } size={ 16 } />
			</Button>
			<ul className="domain-categories__item-group">
				<li
					className={ clsx( 'domain-categories__item', {
						'is-selected': ! selected,
					} ) }
				>
					<Button onClick={ () => handleSelect() }>
						{
							/* translators: Domain categories filtering. Option to disable the filter and view all categories. */
							__( 'View all', __i18n_text_domain__ )
						}
					</Button>
				</li>
				{ domainCategories.map( ( { slug, title } ) => (
					<li
						key={ slug }
						className={ clsx( 'domain-categories__item', {
							'is-selected': slug === selected,
						} ) }
					>
						<Button onClick={ () => handleSelect( slug ) }>{ title }</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DomainPickerCategories;
