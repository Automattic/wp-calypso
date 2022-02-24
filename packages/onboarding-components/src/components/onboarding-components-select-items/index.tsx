import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import './style.scss';
import { TranslateResult } from 'i18n-calypso';
import { SelectItem } from '../../types';

interface Props< T > {
	className?: string;
	items: SelectItem< T >[];
	onSelect: ( value: T ) => void;
	preventWidows: ( text: TranslateResult, wordsToKeep?: number ) => string;
}

function SelectItems< T >( {
	className,
	items,
	onSelect,
	preventWidows,
}: Props< T > ): React.ReactElement {
	return (
		<div className={ classnames( 'onboarding-components-select-items', className ) }>
			{ items.map(
				( { key, title, description, icon, actionText, value, hidden } ) =>
					hidden && (
						<div key={ key } className="onboarding-components-select-items__item">
							<Icon
								className="onboarding-components-select-items__item-icon"
								icon={ icon }
								size={ 24 }
							/>
							<div className="onboarding-components-select-items__item-info-wrapper">
								<div className="onboarding-components-select-items__item-info">
									<h2 className="onboarding-components-select-items__item-title">
										{ preventWidows( title ) }
									</h2>
									<div className="onboarding-components-select-items__item-description">
										{ preventWidows( description ) }
									</div>
								</div>
								<Button
									className="onboarding-components-select-items__item-button"
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
