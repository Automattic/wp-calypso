import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationItem,
} from 'calypso/jetpack-cloud/components/layout/nav';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import { useProductBundleSize } from './hooks/use-product-bundle-size';

export default function IssueLicenseV2() {
	const { selectedSize, setSelectedSize, availableSizes } = useProductBundleSize();
	const translate = useTranslate();

	return (
		<Layout
			className="issue-license-v2"
			title={ translate( 'Issue a new License' ) }
			wide
			withBorder
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Issue product licenses' ) } </Title>
					<Subtitle>
						{ translate( 'Select single product licenses or save when you issue in bulk' ) }
					</Subtitle>

					<LayoutHeaderActions>
						<Button primary>Issue license </Button>
					</LayoutHeaderActions>
				</LayoutHeader>

				<LayoutNavigation
					selectedText={
						selectedSize === 1
							? translate( 'Single license' )
							: ( translate( '%(size)d licenses', { args: { selectedSize } } ) as string )
					}
				>
					{ availableSizes.map( ( size ) => (
						<LayoutNavigationItem
							label={
								size === 1
									? translate( 'Single license' )
									: ( translate( '%(size)d licenses', { args: { size } } ) as string )
							}
							selected={ selectedSize === size }
							onClick={ () => setSelectedSize( size ) }
						/>
					) ) }
				</LayoutNavigation>
			</LayoutTop>

			<LayoutBody>
				<div>body here</div>
			</LayoutBody>
		</Layout>
	);
}
