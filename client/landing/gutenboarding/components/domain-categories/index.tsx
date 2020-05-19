/**
 * External dependencies
 */
import * as React from 'react';
import { Button, Icon } from '@wordpress/components';
import classNames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	onSelect: ( domainCategorySlug?: string ) => void;
	selected?: string;
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	const { __ } = useI18n();
	const domainCategories = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getCategories()
	);

	// Sort domain categories by tier
	const sortedDomainCategories = [
		...domainCategories
			.filter( ( { tier } ) => tier !== null )
			.sort( ( a, b ) => ( a > b ? 1 : -1)  ),
		...domainCategories.filter( ( { tier } ) => tier === null ),
	];

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
				<Icon icon="arrow-down-alt2" size={ 12 }></Icon>
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
				{ sortedDomainCategories.map( ( { slug, title } ) => (
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
