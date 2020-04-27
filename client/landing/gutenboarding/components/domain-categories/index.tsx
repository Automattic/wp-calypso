/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import { domainCategories, DomainCategory } from '../../domains-constants';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	onSelect: ( domainCategory: DomainCategory ) => void;
	selected?: string;
}

const DomainPickerCategories: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	return (
		<div className="domain-categories">
			<ul className="domain-categories__item-group">
				{ domainCategories.map( ( domainCategory ) => (
					<li
						key={ domainCategory }
						className={ classNames( 'domain-categories__item', {
							'is-selected': domainCategory === selected,
						} ) }
					>
						<Button isTertiary onClick={ () => onSelect( domainCategory ) }>
							{ domainCategory }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default DomainPickerCategories;
