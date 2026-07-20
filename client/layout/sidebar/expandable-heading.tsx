import { Count, Gridicon, MaterialIcon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import { decodeEntities } from 'calypso/lib/formatting';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

interface ExpandableSidebarHeadingProps {
	title: TranslateResult;
	count?: number;
	countLabel?: string;
	compactCount?: boolean;
	onClick?: ( event?: MouseEvent< HTMLAnchorElement > ) => void;
	customIcon?: ReactNode;
	icon?: string | null;
	materialIcon?: string | null;
	materialIconStyle?: string | null;
	expanded?: boolean;
	menuId?: string;
	hideExpandableIcon?: boolean;
	inlineText?: ReactNode;
	expandableIconClick?: () => void;
	prependContent?: ReactNode;
	appendContent?: ReactNode;
	navigationLabel?: string;
	url?: string;
	moreMenuActions?: JSX.Element;
}

const ExpandableSidebarHeading = ( {
	title,
	count,
	countLabel,
	compactCount,
	icon,
	customIcon,
	materialIcon,
	materialIconStyle,
	expanded,
	menuId,
	hideExpandableIcon,
	inlineText,
	expandableIconClick,
	prependContent,
	appendContent,
	moreMenuActions,
	...props
}: ExpandableSidebarHeadingProps ) => {
	const translate = useTranslate();
	const renderedTitle = typeof title === 'string' ? decodeEntities( title ) : title;

	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			{ ...props }
		>
			{ prependContent }
			{ icon && <Gridicon className="sidebar__menu-icon" icon={ icon } /> }
			{ materialIcon && (
				<MaterialIcon
					className="sidebar__menu-icon"
					icon={ materialIcon }
					style={ materialIconStyle ?? undefined }
				/>
			) }
			{ undefined !== customIcon && customIcon }
			<span className="sidebar__expandable-title">
				{ renderedTitle }
				<span className="sidebar__actions-and-count">
					{ moreMenuActions }
					{ count && count > 0 ? (
						<Count count={ count } compact={ compactCount } aria-label={ countLabel } />
					) : null }
				</span>
				{ inlineText && <span className="sidebar__inline-text">{ inlineText }</span> }
			</span>
			{ appendContent }
			{ ! hideExpandableIcon &&
				( expandableIconClick ? (
					<Button
						variant="link"
						className="sidebar__expandable-button"
						onClick={ ( ev: MouseEvent< HTMLButtonElement > ) => {
							ev.stopPropagation();
							expandableIconClick();
						} }
						onKeyDown={ ( ev: KeyboardEvent< HTMLButtonElement > ) => {
							// Prevent bubbling or the SidebarHeading's onClick will also trigger.
							if ( ev.key === 'Enter' ) {
								ev.stopPropagation();
							}
						} }
						aria-label={ expanded ? translate( 'Collapse menu' ) : translate( 'Expand menu' ) }
						icon={ <Icon icon={ chevronDown } className="sidebar__expandable-arrow" size={ 24 } /> }
					/>
				) : (
					<Icon icon={ chevronDown } className="sidebar__expandable-arrow" size={ 24 } />
				) ) }
		</SidebarHeading>
	);
};

export default ExpandableSidebarHeading;
