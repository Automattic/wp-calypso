/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	onSelect: ( domainCategorySlug?: string ) => void;
	selected?: string;
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleSelect = ( slug?: string ) => {
		setIsOpen( false );
		onSelect( slug );
	};

	const domainCategories = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getCategories()
	);

	return (
		<div className={ classNames( 'domain-categories', { 'is-open': isOpen } ) }>
			<Button
				className="domain-categories__dropdown-button"
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<span>{ ! selected ? __( 'All Categories', __i18n_text_domain__ ) : selected }</span>
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
							__( 'View all', __i18n_text_domain__ )
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
