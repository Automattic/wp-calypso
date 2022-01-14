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
			popoverClassName="dns-records-list-item__action-menu-popover"
			position="bottom left"
		>
			{ actions.map( ( action ) => {
				return (
					<PopoverMenuItem
						disabled={ action.disabled }
						key={ key++ }
						onClick={ () => action.callback( record ) }
					>
						{ action.icon }
						{ action.title }
					</PopoverMenuItem>
				);
			} ) }
		</EllipsisMenu>
	);

	return (
		<div
			className={ classNames(
				'dns-records-list-item__wrapper',
				{ 'is-disabled': disabled },
				{ 'is-header': isHeader }
			) }
		>
			<div className="dns-records-list-item">
				<div className="dns-records-list-item__data dns-records-list-item__type">
					<strong>{ type }</strong>
				</div>
				<div className="dns-records-list-item__data dns-records-list-item__name">
					<span>{ name }</span>
				</div>
				<div className="dns-records-list-item__data dns-records-list-item__value">
					<span>{ value }</span>
				</div>
				<div className="dns-records-list-item__data dns-records-list-item__menu">
					{ ! isHeader && menu }
				</div>
			</div>
		</div>
	);
}

DnsRecordsListItem.defaultProps = {
	isHeader: false,
	disabled: false,
	showSupportInfo: true,
};

export default DnsRecordsListItem;
