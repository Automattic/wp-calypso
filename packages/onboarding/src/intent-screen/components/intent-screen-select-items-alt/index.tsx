import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import React from 'react';
import './style.scss';
import { SelectAltItem } from '../../types';

interface Props< T > {
	className?: string;
	items: SelectAltItem< T >[];
	onSelect: ( value: T ) => void;
}

function SelectItemsAlt< T >( { className, items, onSelect }: Props< T > ): React.ReactElement {
	return (
		<div className={ classnames( 'onboarding-components-select-items-alt', className ) }>
			{ items.map(
				( { disable, disableText, show, key, description, actionText, value } ) =>
					show && (
						<div key={ key } className="onboarding-components-select-items-alt__item">
							<div className="onboarding-components-select-items-alt__item-info-wrapper">
								<div className="onboarding-components-select-items-alt__item-info">
									<p className="onboarding-components-select-items-alt__item-description">
										{ description }
									</p>
								</div>
								<Button
									disabled={ disable }
									className="onboarding-components-select-items-alt__item-button"
									onClick={ () => onSelect( value ) }
								>
									{ actionText }
								</Button>

								{ disable && (
									<>
										&nbsp;
										<Tooltip text={ disableText } position="bottom center">
											<div className="onboarding-components-select-items-alt__item-disabled-info">
												<Icon icon={ info } size={ 20 } />
											</div>
										</Tooltip>
									</>
								) }
							</div>
						</div>
					)
			) }
		</div>
	);
}

export default SelectItemsAlt;
