import { Button } from '@automattic/components';
import classnames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import React from 'react';
import './style.scss';

export interface SelectAltItem< T > {
	show: boolean;
	key: string;
	description: TranslateResult;
	value: T;
	actionText: TranslateResult;
}

interface Props< T > {
	className?: string;
	items: SelectAltItem< T >[];
	onSelect: ( value: T ) => void;
}

function SelectItems< T >( { className, items, onSelect }: Props< T > ): React.ReactElement {
	return (
		<div className={ classnames( 'select-items-alt', className ) }>
			{ items.map(
				( { show, key, description, actionText, value } ) =>
					show && (
						<div key={ key } className="select-items-alt__item">
							<div className="select-items-alt__item-info-wrapper">
								<div className="select-items-alt__item-info">
									<p className="select-items-alt__item-description">{ description }</p>
								</div>
								<Button
									className="select-items-alt__item-button"
									onClick={ () => onSelect( value ) }
								>
									{ actionText }
								</Button>
							</div>
						</div>
					)
			) }
		</div>
	);
}

export default SelectItems;
