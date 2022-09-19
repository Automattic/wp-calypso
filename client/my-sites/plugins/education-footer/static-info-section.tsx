import { useI18n } from '@wordpress/react-i18n';
import FeatureItem from 'calypso/components/feature-item';
import Section from 'calypso/components/section';
import { preventWidows } from 'calypso/lib/formatting';
import ThreeColumnContainer from './three-column-container';

const HeaderContent = () => {
	const { __ } = useI18n();
	return (
		<>
			{ preventWidows( __( 'You pick the plugin.' ) ) }
			<br />
			{ preventWidows( __( "We'll take care of the rest." ) ) }
		</>
	);
};

const StaticInfoSection = () => {
	const { __ } = useI18n();
	return (
		<Section header={ <HeaderContent /> } dark>
			<ThreeColumnContainer>
				<FeatureItem header={ __( 'Fully Managed' ) }>
					{ __(
						'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Thousands of plugins' ) }>
					{ __(
						"From WordPress.com premium plugins to thousands more community-authored plugins, we've got you covered."
					) }
				</FeatureItem>
				<FeatureItem header={ __( 'Flexible pricing' ) }>
					{ __(
						"Pay yearly and save. Or keep it flexible with monthly premium plugin pricing. It's entirely up to you."
					) }
				</FeatureItem>
			</ThreeColumnContainer>
		</Section>
	);
};

export default StaticInfoSection;
