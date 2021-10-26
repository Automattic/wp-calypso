import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import React from 'react';
import './style.scss';

export interface SelectItem< T > {
	key: string;
	title: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	value: T;
	actionText: TranslateResult;
}

interface Props< T > {
	className?: string;
	items: SelectItem< T >[];
	onSelect: ( value: T ) => void;
}

function SelectItems< T >( { className, items, onSelect }: Props< T > ): React.ReactElement {
	return (
		<div className={ classnames( 'select-items', className ) }>
			{ items.map( ( { key, title, description, icon, actionText, value } ) => (
				<div key={ key } className="select-items__item">
					<Icon className="select-items__item-icon" icon={ icon } size={ 24 } />
					<div className="select-items__item-info-wrapper">
						<div className="select-items__item-info">
							<h2 className="select-items__item-title">{ title }</h2>
							<p className="select-items__item-description">{ description }</p>
						</div>
						<Button className="select-items__item-button" onClick={ () => onSelect( value ) }>
							{ actionText }
						</Button>
					</div>
				</div>
			) ) }
		</div>
	);
}

export default SelectItems;
