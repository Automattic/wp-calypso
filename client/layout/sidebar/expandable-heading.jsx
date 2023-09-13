import { Count, Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import MaterialIcon from 'calypso/components/material-icon';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import { decodeEntities } from 'calypso/lib/formatting';

const noop = () => {};

const ExpandableSidebarHeading = ( {
	title,
	count,
	onClick,
	icon,
	customIcon,
	materialIcon,
	materialIconStyle,
	expanded,
	menuId,
	hideExpandableIcon,
	inlineText,
	...props
} ) => {
	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			onClick={ onClick }
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
			{ ! hideExpandableIcon && (
				<MaterialIcon icon="keyboard_arrow_down" className="sidebar__expandable-arrow" />
			) }
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
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
