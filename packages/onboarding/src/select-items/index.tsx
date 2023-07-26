import { Badge, Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import './style.scss';
import { TranslateResult } from 'i18n-calypso';

export interface SelectItem< T > {
	key: string;
	title: TranslateResult;
	badge?: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	value: T;
	actionText: TranslateResult | null;
	hidden?: boolean;
	isPrimary?: boolean;
}

interface Props< T > {
	className?: string;
	items: SelectItem< T >[];
	onSelect: ( value: T ) => void;
	preventWidows: ( text: TranslateResult, wordsToKeep?: number ) => string;
}

function SelectItems< T >( { className, items, onSelect, preventWidows }: Props< T > ) {
	return (
		<div className={ classnames( 'select-items', className ) }>
			{ items.map( ( { key, title, badge, description, icon, actionText, value, isPrimary } ) => (
				<div key={ key } className="select-items__item">
					<Icon className="select-items__item-icon" icon={ icon } size={ 24 } />
					<div className="select-items__item-info-wrapper">
						<div className="select-items__item-info">
							<h2 className="select-items__item-title">
								<span className="select-items__item-title-text">{ preventWidows( title ) }</span>
								{ badge && (
									<span className="select-items__item-title-badge">
										<Badge className="free-domain__primary-badge" type="info-green">
											{ preventWidows( badge ) }
										</Badge>
									</span>
								) }
							</h2>
							<div className="select-items__item-description">{ preventWidows( description ) }</div>
						</div>
						{ actionText && (
							<Button
								primary={ isPrimary }
								className="select-items__item-button"
								onClick={ () => onSelect( value ) }
							>
								{ actionText }
							</Button>
						) }
					</div>
				</div>
			) ) }
		</div>
	);
}

export default SelectItems;
