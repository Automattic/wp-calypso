import { currencyDollar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureMoved from 'calypso/components/feature-moved';
import Main from 'calypso/components/main';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const JetpackMonetize = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main>
			<DocumentHead title="Hello" />
			<FeatureMoved
				icon={ currencyDollar }
				title={ translate( 'Monetize has moved' ) }
				description={ translate(
					'Monetize is now part of Jetpack for enhanced features. Access them via Jetpack → Monetize in your dashboard.'
				) }
				buttonText={ translate( 'Go to Jetpack Monetize' ) }
				buttonLink={ `/earn/${ siteSlug }` }
			/>
		</Main>
	);
};

export default JetpackMonetize;
