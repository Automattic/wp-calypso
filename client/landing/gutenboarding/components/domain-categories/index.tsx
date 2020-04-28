/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useI18n } from '@automattic/react-i18n';

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
	return (
		<div className="domain-categories">
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
						<Button onClick={ () => onSelect( domainCategory ) }>{ domainCategory }</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DomainPickerCategories;
