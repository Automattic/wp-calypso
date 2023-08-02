import {
	Card,
	Flex,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

export const RecommendedSitePlaceholder = () => {
	return (
		<Card className="recommended-site is-placeholder" as="li">
			<Flex justify="flex-end">
				<div className="recommended-site__dismiss-button is-placeholder">Dismiss Button</div>
			</Flex>
			<HStack justify="flex-start" className="recommended-site__profile is-placeholder" spacing="4">
				<span className="recommended-site__profile-avatar is-placeholder">Avatar</span>
				<VStack spacing={ 0 } className="recommended-site__profile-data is-placeholder">
					<h3 className="recommended-site__site-title is-placeholder">Site title</h3>
					<span className="recommended-site__site-url is-placeholder">Site domain</span>
				</VStack>
			</HStack>
			<p className="recommended-site__site-description is-placeholder">Site description 1</p>
			<p className="recommended-site__site-description is-placeholder">Site description 2</p>
			<div className="recommended-site__subscribe-button is-placeholder">Subscribe</div>
		</Card>
	);
};

export const RecommendedSitesPlaceholder = ( { count }: { count: number } ) => {
	const items = [];

	for ( let i = 0; i < count; i++ ) {
		items.push( <RecommendedSitePlaceholder key={ i } /> );
	}

	return <>{ items }</>;
};
