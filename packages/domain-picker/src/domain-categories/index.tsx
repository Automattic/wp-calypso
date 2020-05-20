/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import classNames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { useState } from '@wordpress/element';
import { DomainSuggestions } from '@automattic/data-stores';

/**
 * Style dependencies
 */
import './style.scss';

type DomainCategory = DomainSuggestions.DomainCategory;

export interface Props {
	onSelect: ( domainCategorySlug?: string ) => void;
	selected?: string;
	domainCategories: DomainCategory[];
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( {
	onSelect,
	selected,
	domainCategories,
} ) => {
	const { __ } = useI18n();

	const [ isOpen, setIsOpen ] = useState( false );

	const handleSelect = ( slug?: string ) => {
		setIsOpen( false );
		onSelect( slug );
	};

	return (
		<div className={ classNames( 'domain-categories', { 'is-open': isOpen } ) }>
			<Button
				className="domain-categories__dropdown-button"
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<span>{ ! selected ? __( 'All Categories' ) : selected }</span>
				<Icon icon={ chevronDown } size={ 16 } />
			</Button>
			<ul className="domain-categories__item-group">
				<li
					className={ classNames( 'domain-categories__item', {
						'is-selected': ! selected,
					} ) }
				>
					<Button onClick={ () => handleSelect() }>
						{
							/* translators: Domain categories filtering. Option to disable the filter and view all categories. */
							__( 'View all' )
						}
					</Button>
				</li>
				{ domainCategories.map( ( { slug, title } ) => (
					<li
						key={ slug }
						className={ classNames( 'domain-categories__item', {
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
