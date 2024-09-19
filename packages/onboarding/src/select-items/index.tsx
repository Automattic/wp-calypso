import { Badge, Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import './style.scss';
import { TranslateResult } from 'i18n-calypso';

export interface SelectItem< T > {
	key: string;
	title: TranslateResult;
	badge?: TranslateResult;
	description: TranslateResult;
	icon: React.ReactElement;
	titleIcon?: React.ReactElement; // If titleIcon is set, it will show on the same line of title and, icon will be ignored
	value: T;
	actionText: TranslateResult | null;
	hidden?: boolean;
	isPrimary?: boolean;
	allItemClickable?: boolean;
}

interface Props< T > {
	className?: string;
	items: SelectItem< T >[];
	onSelect: ( value: T ) => void;
	preventWidows: ( text: TranslateResult, wordsToKeep?: number ) => string;
}

function SelectItems< T >( { className, items, onSelect, preventWidows }: Props< T > ) {
	return (
		<div className={ clsx( 'select-items', className ) }>
			{ items.map(
				( {
					key,
					title,
					badge,
					description,
					icon,
					titleIcon,
					actionText,
					value,
					isPrimary,
					allItemClickable,
				} ) => (
					<div key={ key } className="select-items__item">
						{ ! titleIcon && (
							<Icon className="select-items__item-icon" icon={ icon } size={ 24 } />
						) }
						<div className="select-items__item-info-wrapper">
							<div className="select-items__item-info">
								<h2 className="select-items__item-title">
									{ titleIcon && (
										<Icon className="select-items__item-icon" icon={ titleIcon } size={ 24 } />
									) }
									<span className="select-items__item-title-text">{ preventWidows( title ) }</span>
									{ badge && (
										<span className="select-items__item-title-badge">
											<Badge className="free-domain__primary-badge" type="info-green">
												{ preventWidows( badge ) }
											</Badge>
										</span>
									) }
								</h2>
								<div className="select-items__item-description">
									{ preventWidows( description ) }
								</div>
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
						{ allItemClickable && (
							<button
								className="select-items__item-clickable"
								onClick={ () => onSelect( value ) }
							/>
						) }
					</div>
				)
			) }
		</div>
	);
}

export default SelectItems;
