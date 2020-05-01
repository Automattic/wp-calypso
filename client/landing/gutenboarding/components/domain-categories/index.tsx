/**
 * External dependencies
 */
import * as React from 'react';
import { Button, Icon } from '@wordpress/components';
import classNames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */

import { domainCategories, DomainCategory } from '../../domains-constants';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	onSelect: ( domainCategory?: DomainCategory ) => void;
	selected?: DomainCategory;
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	const { __ } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

	const handleSelect = ( domainCategory ) => {
		setIsOpen( false );
		onSelect( domainCategory );
	};

	return (
		<div className={ classNames( 'domain-categories', { 'is-open': isOpen } ) }>
			<Button
				className="domain-categories__dropdown-button"
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<span>{ ! selected ? 'All Categories' : selected }</span>
				<Icon icon="arrow-down-alt2" size={ 12 }></Icon>
			</Button>
			<ul className="domain-categories__item-group">
				<li
					className={ classNames( 'domain-categories__item', {
						'is-selected': ! selected,
					} ) }
				>
					<Button onClick={ () => onSelect() }>
						{
							/* translators: Domain categories filtering. Option to disable the filter and view all categories. */
							__( 'View all' )
						}
					</Button>
				</li>
				{ domainCategories.map( ( domainCategory ) => (
					<li
						key={ domainCategory }
						className={ classNames( 'domain-categories__item', {
							'is-selected': domainCategory === selected,
						} ) }
					>
						<Button onClick={ () => handleSelect( domainCategory ) }>{ domainCategory }</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DomainPickerCategories;
