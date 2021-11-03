import './style.scss';
import { Icon, moreVertical } from '@wordpress/icons';
import classNames from 'classnames';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

function DnsRecordsListItem( { type, name, value, actions, disabled, isHeader, record } ) {
	let key = 0;
	const menu = actions && (
		<EllipsisMenu
			icon={
				<Icon
					icon={ moreVertical }
					size={ 28 }
					className="dns-records-list-item__action-menu gridicon"
				/>
			}
		>
			{ actions.map( ( action ) => {
				return (
					<PopoverMenuItem key={ key++ } onClick={ () => action.callback( record ) }>
						{ action.icon }
						{ action.title }
					</PopoverMenuItem>
				);
			} ) }
		</EllipsisMenu>
	);

	return (
		<li
			className={ classNames(
				'dns-records__list-item',
				{ 'is-disabled': disabled },
				{ 'is-header': isHeader }
			) }
		>
			<div className="dns-records-list-item dns-records-list-item__type">
				<strong>{ type }</strong>
			</div>
			<div className="dns-records-list-item dns-records-list-item__name">
				<span>{ name }</span>
			</div>
			<div className="dns-records-list-item dns-records-list-item__value">
				<span>{ value ?? 'example-value' }</span>
			</div>
			<div className="dns-records-list-item dns-records-list-item__menu">
				{ ! isHeader && menu }
			</div>
		</li>
	);
}

DnsRecordsListItem.defaultProps = {
	isHeader: false,
	disabled: false,
};

export default DnsRecordsListItem;
