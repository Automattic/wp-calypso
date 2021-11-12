import { Button, Card } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactNode, Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackUpsell from 'calypso/components/jetpack/upsell';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

interface Props {
	bodyText: TranslateResult | ReactNode;
	buttonLink?: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent?: ReactNode;
	onClick?: () => void;
}

const JetpackSearchContent: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	headerText,
	iconComponent,
	onClick,
} ) => {
	const isCloud = isJetpackCloud();
	const translate = useTranslate();

	// Jetpack Cloud uses the Upsell component to render content
	// This is not related to our upsell
	if ( isCloud ) {
		return (
			<JetpackUpsell
				headerText={ headerText }
				bodyText={ bodyText }
				buttonLink={ buttonLink }
				buttonText={ buttonText }
				onClick={ onClick }
				iconComponent={ iconComponent }
			/>
		);
	}

	return (
		<Fragment>
			<FormattedHeader
				headerText={ translate( 'Jetpack Search' ) }
				id="jetpack-search-header"
				align="left"
				brandFont
			/>
			<Card>
				<div className="jetpack-search__content">
					{ iconComponent }
					{ headerText && <h1 className="jetpack-search__header">{ headerText }</h1> }
					<p>{ translate( 'Your visitors are getting our fastest search experience.' ) }</p>
					<Button
						primary
						className="jetpack-search__button"
						href={ buttonLink as string }
						onClick={ onClick || undefined }
					>
						{ buttonText }
					</Button>
				</div>
			</Card>
		</Fragment>
	);
};

export default JetpackSearchContent;
