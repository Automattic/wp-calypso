/**
 * External dependencies
 */
import {
	FlexItem,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHeading as Heading,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalText as Text,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,

	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */

// @unstable: not defined in core
type HeaderProps = {
	title: string;
	subTitle?: string;
	actions?: React.ReactNode;
};

export default function Header( { title, subTitle, actions }: HeaderProps ) {
	return (
		<VStack className="edit-site-page-header" as="header" spacing={ 0 }>
			<HStack className="edit-site-page-header__page-title">
				<Heading
					as="h2"
					level={ 3 }
					weight={ 500 }
					className="edit-site-page-header__title"
					truncate
				>
					{ title }
				</Heading>
				<FlexItem className="edit-site-page-header__actions">{ actions }</FlexItem>
			</HStack>
			{ subTitle && (
				<Text variant="muted" as="p" className="edit-site-page-header__sub-title">
					{ subTitle }
				</Text>
			) }
		</VStack>
	);
}
