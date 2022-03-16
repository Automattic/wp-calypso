import FeatureItem from 'calypso/components/feature-item';

const header = 'The title of the item goes here';

const FeatureItemExample = () => {
	return (
		<FeatureItem header={ header }>
			{ ' ' }
			Some content to be rendered in the item content section.{ ' ' }
		</FeatureItem>
	);
};

FeatureItemExample.displayName = 'FeatureItemExample';

export default FeatureItemExample;
