/**
 * External dependencies
 */
import {
	FlexItem,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
/**
 * Types
 */
import type { PageProps } from '.';
type HeaderProps = Omit< PageProps, 'className' | 'hideTitleFromUI' | 'children' >;

export default function Header( { title, subTitle, actions }: HeaderProps ) {
	return (
		<VStack className="a8c-site-admin-page-header" as="header" spacing={ 0 }>
			<HStack className="a8c-site-admin-page-header__page-title">
				<Heading
					as="h2"
					level={ 3 }
					weight={ 500 }
					className="a8c-site-admin-page-header__title"
					truncate
				>
					{ title }
				</Heading>
				<FlexItem className="a8c-site-admin-page-header__actions">{ actions }</FlexItem>
			</HStack>
			{ subTitle && (
				<Text variant="muted" as="p" className="a8c-site-admin-page-header__sub-title">
					{ subTitle }
				</Text>
			) }
		</VStack>
	);
}
