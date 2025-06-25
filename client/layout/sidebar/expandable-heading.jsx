import { Count, Gridicon, MaterialIcon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronDownSmall } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import { decodeEntities } from 'calypso/lib/formatting';

const ExpandableSidebarHeading = ( {
	title,
	count,
	icon,
	customIcon,
	materialIcon,
	materialIconStyle,
	expanded,
	menuId,
	hideExpandableIcon,
	inlineText,
	expandableIconClick,
	...props
} ) => {
	const translate = useTranslate();
	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			{ ...props }
		>
			{ icon && <Gridicon className="sidebar__menu-icon" icon={ icon } /> }
			{ materialIcon && (
				<MaterialIcon
					className="sidebar__menu-icon"
					icon={ materialIcon }
					style={ materialIconStyle }
				/>
			) }
			{ undefined !== customIcon && customIcon }
			<span className="sidebar__expandable-title">
				{ decodeEntities( title ) }
				{ undefined !== count && <Count count={ count } /> }
				{ inlineText && <span className="sidebar__inline-text">{ inlineText }</span> }
			</span>
			{ ! hideExpandableIcon &&
				( expandableIconClick ? (
					<Button
						variant="link"
						className="sidebar__expandable-button"
						onClick={ ( ev ) => {
							ev.stopPropagation();
							expandableIconClick();
						} }
						onKeyDown={ ( ev ) => {
							// Prevent bubbling or the SidebarHeading's onClick will also trigger.
							if ( ev.key === 'Enter' ) {
								ev.stopPropagation();
							}
						} }
						aria-label={ expanded ? translate( 'Collapse menu' ) : translate( 'Expand menu' ) }
						icon={
							<Icon icon={ chevronDownSmall } className="sidebar__expandable-arrow" size={ 24 } />
						}
					/>
				) : (
					<Icon icon={ chevronDownSmall } className="sidebar__expandable-arrow" size={ 24 } />
				) ) }
		</SidebarHeading>
	);
};

ExpandableSidebarHeading.propTypes = {
	title: PropTypes.oneOfType( [ TranslatableString, PropTypes.element ] ).isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
	customIcon: PropTypes.node,
	icon: PropTypes.string,
	materialIcon: PropTypes.string,
	materialIconStyle: PropTypes.string,
	hideExpandableIcon: PropTypes.bool,
	expandableIconClick: PropTypes.func,
};

export default ExpandableSidebarHeading;
