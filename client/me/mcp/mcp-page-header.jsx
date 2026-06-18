import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

/**
 * Shared top-of-page chrome for `/me/mcp*` routes (Figma: AI & MCP settings — primary nav header).
 * Keeps title + subtitle consistent across hub and subpages.
 */
export function useMcpPageChrome() {
	const translate = useTranslate();
	return {
		documentTitle: translate( 'AI and MCP', { textOnly: true } ),
		navigationHeaderProps: {
			navigationItems: [],
			title: translate( 'AI and MCP' ),
			subtitle: translate(
				'Control how AI assistants interact with your WordPress.com account and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="mcp" showIcon={ false } />,
					},
				}
			),
		},
	};
}
