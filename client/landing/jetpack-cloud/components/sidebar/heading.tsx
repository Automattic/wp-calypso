/**
 * External dependencies
 */
import React, { ReactElement } from 'react';

/**
 * Internal dependencies
 */
import MaterialIcon from 'components/material-icon';

interface Props {
	title: string;
	materialIcon?: string;
	materialIconStyle?: string;
	tag?: string;
	onClick?: CallableFunction;
	link?: string;
}

function StaticSidebarHeading( props: Props ): ReactElement {
	const { materialIcon, materialIconStyle, title, link } = props;

	const InnerTag = link ? 'a' : 'span';

	return (
		<li>
			<InnerTag href={ link } className="sidebar__menu-link">
				{ materialIcon && (
					<MaterialIcon
						className="sidebar__menu-icon"
						icon={ materialIcon }
						style={ materialIconStyle }
					/>
				) }
				{ title }
			</InnerTag>
		</li>
	);
}

export default StaticSidebarHeading;
