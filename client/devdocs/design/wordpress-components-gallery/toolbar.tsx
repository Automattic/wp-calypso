/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	alignCenter,
	alignLeft,
	alignRight,
	code,
	formatBold,
	formatItalic,
	formatStrikethrough,
	link,
	more,
	paragraph,
} from '@wordpress/icons';
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	DropdownMenu,
	SVG,
	Path,
	__experimentalToolbarItem as ToolbarItem,
} from '@wordpress/components';

function InlineImageIcon() {
	return (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<Path d="M4 18.5h16V17H4v1.5zM16 13v1.5h4V13h-4zM5.1 15h7.8c.6 0 1.1-.5 1.1-1.1V6.1c0-.6-.5-1.1-1.1-1.1H5.1C4.5 5 4 5.5 4 6.1v7.8c0 .6.5 1.1 1.1 1.1zm.4-8.5h7V10l-1-1c-.3-.3-.8-.3-1 0l-1.6 1.5-1.2-.7c-.3-.2-.6-.2-.9 0l-1.3 1V6.5zm0 6.1l1.8-1.3 1.3.8c.3.2.7.2.9-.1l1.5-1.4 1.5 1.4v1.5h-7v-.9z" />
		</SVG>
	);
}

const ToolbarExample = () => (
	// id is required for server side rendering
	<Toolbar label="Options" id="options-toolbar">
		<ToolbarGroup>
			<ToolbarButton icon={ paragraph } label="Paragraph" />
		</ToolbarGroup>
		<ToolbarGroup>
			<ToolbarItem>
				{ ( toggleProps ) => (
					<DropdownMenu
						hasArrowIndicator
						icon={ alignLeft }
						label="Change text alignment"
						controls={ [
							{
								icon: alignLeft,
								title: 'Align left',
								isActive: true,
							},
							{
								icon: alignCenter,
								title: 'Align center',
							},
							{
								icon: alignRight,
								title: 'Align right',
							},
						] }
						toggleProps={ toggleProps }
					/>
				) }
			</ToolbarItem>
		</ToolbarGroup>
		<ToolbarGroup>
			<ToolbarButton>Text</ToolbarButton>
			<ToolbarButton icon={ formatBold } label="Bold" isPressed />
			<ToolbarButton icon={ formatItalic } label="Italic" />
			<ToolbarButton icon={ link } label="Link" />
			<ToolbarGroup
				isCollapsed
				icon={ false }
				label="More rich text controls"
				controls={ [
					{ icon: code, title: 'Inline code' },
					{ icon: <InlineImageIcon />, title: 'Inline image' },
					{
						icon: formatStrikethrough,
						title: 'Strikethrough',
					},
				] }
			/>
		</ToolbarGroup>
		<ToolbarGroup
			icon={ more }
			label="Change text alignment"
			isCollapsed
			controls={ [
				{
					icon: alignLeft,
					title: 'Align left',
					isActive: true,
				},
				{ icon: alignCenter, title: 'Align center' },
				{ icon: alignRight, title: 'Align right' },
			] }
		/>
	</Toolbar>
);

export default ToolbarExample;
