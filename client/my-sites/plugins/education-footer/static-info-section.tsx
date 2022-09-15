import { useI18n } from '@wordpress/react-i18n';
import FeatureItem from 'calypso/components/feature-item';
import Section from 'calypso/components/section';
import { preventWidows } from 'calypso/lib/formatting';
import ThreeColumnContainer from './three-column-container';

const StaticInfoFooter = () => {
	const { __ } = useI18n();
	return (
		<Section
			header={ preventWidows( __( 'Add additional features to your WordPress site. Risk free.' ) ) }
			dark
		>
			<ThreeColumnContainer>
				<FeatureItem header={ __( 'Fully Managed' ) }>
					{ __(
						'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Thousands of plugins' ) }>
					{ __(
						'Along with our hand curated collection of premium plugins, you also have thousands of community developed plugins at your disposal.'
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Flexible pricing' ) }>
					{ __(
						'WordPress.com offers monthly and annual premium plugin pricing for extra flexibility.'
					) }
				</FeatureItem>
			</ThreeColumnContainer>
		</Section>
	);
};

export default StaticInfoFooter;
