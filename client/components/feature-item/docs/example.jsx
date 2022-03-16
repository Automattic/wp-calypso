import FeatureItem from 'calypso/components/feature-item';

const header = 'The title of the item goes here';

const FeatureItemExample = () => {
	return (
		<div style={ { backgroundColor: 'var( --studio-gray-90 )', padding: '10px 20px' } }>
			<FeatureItem header={ header }>
				{ ' ' }
				Some content to be rendered in the item content section.{ ' ' }
			</FeatureItem>
		</div>
	);
};

FeatureItemExample.displayName = 'FeatureItemExample';

export default FeatureItemExample;
